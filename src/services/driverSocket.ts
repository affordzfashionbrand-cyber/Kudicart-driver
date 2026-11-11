import { ensureFreshAuthToken, getApiBaseUrl } from '../api/client';
import { queryClient } from '../lib/queryClient';
import { mapBackendDriverOrder } from '../api/ordersApi';
import { useOrderStore } from '../store/useOrderStore';
import type { TrackingRealtimeMessageContract } from '../contracts/order-contracts';

type DriverSocketListener = (payload: any) => void;

class DriverRealtimeSocket {
  private ws: WebSocket | null = null;
  private isConnecting = false;
  private subscribedOrderId: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<DriverSocketListener>();
  private shouldStayConnected = false;
  private reconnectAttempts = 0;

  private getWsUrl(token: string): string {
    const apiBase = getApiBaseUrl().replace(/\/+$/, '');
    const wsBase = apiBase.startsWith('https://')
      ? apiBase.replace(/^https:\/\//, 'wss://')
      : apiBase.replace(/^http:\/\//, 'ws://');
    return `${wsBase}/ws/tracking?token=${encodeURIComponent(token)}`;
  }

  private lastSeqByOrder: Record<string, number> = {};
  private lastSocketToken: string | null = null;

  public resetSessionState() {
    this.lastSeqByOrder = {};
    this.lastSocketToken = null;
    this.subscribedOrderId = null;
  }

  public async connect(orderId?: string) {
    if (orderId) {
      this.subscribedOrderId = orderId;
    }
    this.shouldStayConnected = true;

    if (typeof WebSocket === 'undefined') return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      if (this.subscribedOrderId) {
        this.subscribe(this.subscribedOrderId);
      }
      return;
    }
    if (this.isConnecting) return;

    const token = await ensureFreshAuthToken(this.reconnectAttempts > 0);
    if (!token) return;
    if (this.lastSocketToken && this.lastSocketToken !== token) {
      this.lastSeqByOrder = {};
    }
    this.lastSocketToken = token;

    this.isConnecting = true;
    try {
      const ws = new WebSocket(this.getWsUrl(token));
      this.ws = ws;

      ws.onopen = () => {
        this.isConnecting = false;
        this.startPing();
        if (this.subscribedOrderId) {
          this.subscribe(this.subscribedOrderId);
        }
      };

      ws.onmessage = (event) => {
        try {
          this.reconnectAttempts = 0;
          const msg = JSON.parse(
            typeof event.data === 'string' ? event.data : '{}',
          ) as Partial<TrackingRealtimeMessageContract> & Record<string, any>;
          if (!msg || typeof msg !== 'object') {
            return;
          }

          if (msg.orderId && typeof msg.seq === 'number') {
            const lastSeq = this.lastSeqByOrder[msg.orderId] ?? 0;
            if (msg.seq <= lastSeq) {
              return;
            }
            this.lastSeqByOrder[msg.orderId] = msg.seq;
          }

          if (
            msg.type === 'TRY_AND_BUY_UPDATED' ||
            msg.type === 'ORDER_STATUS_UPDATE' ||
            msg.type === 'ORDER_ARRIVED'
          ) {
            if (msg.order) {
              const mapped = mapBackendDriverOrder(msg.order);
              useOrderStore.getState().syncOrderFromServer(mapped);
            } else if (msg.orderId) {
              const partialUpdate: Record<string, any> = { id: msg.orderId };
              if (msg.orderNumber !== undefined) {
                partialUpdate.orderNumber = msg.orderNumber;
              }
              if (msg.status !== undefined) {
                partialUpdate.status = msg.status;
              }
              if (msg.stage !== undefined) {
                partialUpdate.tryAndBuyStage = msg.stage;
              }
              if (msg.arrivedAt !== undefined && msg.arrivedAt !== null) {
                partialUpdate.arrivedAt = msg.arrivedAt;
              }
              if (msg.type === 'ORDER_ARRIVED') {
                partialUpdate.isArrived = true;
                if (partialUpdate.arrivedAt === undefined) {
                  partialUpdate.arrivedAt = msg.timestamp || new Date().toISOString();
                }
              }
              if (Array.isArray(msg.items) || msg.tryAndBuySession) {
                const mappedDetails = mapBackendDriverOrder({
                  id: msg.orderId,
                  orderNumber: msg.orderNumber,
                  orderType: 'TRY_AND_BUY',
                  status: msg.status || 'OUT_FOR_DELIVERY',
                  tryAndBuyStage: msg.stage,
                  tryAndBuySession: msg.tryAndBuySession,
                  items: msg.items,
                });
                if (Array.isArray(msg.items)) {
                  partialUpdate.items = mappedDetails.items;
                  partialUpdate.itemsCount = mappedDetails.itemsCount;
                }
                if (msg.tryAndBuySession) {
                  partialUpdate.tryAndBuyStage = mappedDetails.tryAndBuyStage;
                  partialUpdate.trialStartedAt = mappedDetails.trialStartedAt;
                  partialUpdate.trialEndsAt = mappedDetails.trialEndsAt;
                  partialUpdate.trialDurationMinutes = mappedDetails.trialDurationMinutes;
                  partialUpdate.finalPayableTotal = mappedDetails.finalPayableTotal;
                  partialUpdate.refundAmount = mappedDetails.refundAmount;
                  partialUpdate.amountDue = mappedDetails.amountDue;
                }
              }

              useOrderStore.getState().syncOrderFromServer(partialUpdate as any);
              // Backend WS status/Try & Buy broadcasts may omit full order fields;
              // also hydrate canonical order from REST so totals/timeline stay in sync.
              void useOrderStore.getState().refreshOrderAsync(msg.orderId);
            }
            queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
          }

          this.listeners.forEach((fn) => fn(msg));
        } catch (err) {
          console.warn('[DriverSocket] Message parse error:', err);
        }
      };

      ws.onclose = (event) => {
        this.isConnecting = false;
        this.stopPing();
        this.ws = null;
        if (event?.code === 4001 || event?.code === 4003) {
          // Terminal auth/authorization rejection — do not reconnect blindly
          this.shouldStayConnected = false;
          this.subscribedOrderId = null;
          this.reconnectAttempts = 0;
          return;
        }
        if (this.shouldStayConnected) {
          this.reconnectAttempts += 1;
          if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
          this.reconnectTimer = setTimeout(() => {
            this.connect().catch(() => {});
          }, 4000);
        }
      };

      ws.onerror = () => {
        this.isConnecting = false;
      };
    } catch {
      this.isConnecting = false;
    }
  }

  public subscribe(orderId: string) {
    this.subscribedOrderId = orderId;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'SUBSCRIBE', orderId }));
    } else {
      this.connect(orderId).catch(() => {});
    }
  }

  public sendLocation(
    orderId: string,
    coords: { latitude: number; longitude: number; heading?: number; speed?: number },
  ) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'LOCATION_UPDATE',
          orderId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          heading: coords.heading ?? 0,
          speed: coords.speed ?? 0,
          timestamp: Date.now(),
        }),
      );
    }
  }

  public addListener(fn: DriverSocketListener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING' }));
      }
    }, 25000);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  public disconnect() {
    this.shouldStayConnected = false;
    this.subscribedOrderId = null;
    this.reconnectAttempts = 0;
    this.lastSeqByOrder = {};
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
  }
}

export const driverSocket = new DriverRealtimeSocket();
