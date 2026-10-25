package com.kudicartdriverapp.services;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import androidx.core.content.ContextCompat;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class NativeTrackingModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public NativeTrackingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "NativeTrackingModule";
    }

    @ReactMethod
    public void startTrackingService(Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, LocationForegroundService.class);
            serviceIntent.setAction(LocationForegroundService.ACTION_START_SERVICE);
            ContextCompat.startForegroundService(reactContext, serviceIntent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("TRACKING_START_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void stopTrackingService(Promise promise) {
        try {
            Intent serviceIntent = new Intent(reactContext, LocationForegroundService.class);
            serviceIntent.setAction(LocationForegroundService.ACTION_STOP_SERVICE);
            reactContext.startService(serviceIntent);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("TRACKING_STOP_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void isTrackingRunning(Promise promise) {
        try {
            ActivityManager manager = (ActivityManager) reactContext.getSystemService(Context.ACTIVITY_SERVICE);
            if (manager != null) {
                for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
                    if (LocationForegroundService.class.getName().equals(service.service.getClassName())) {
                        promise.resolve(true);
                        return;
                    }
                }
            }
            promise.resolve(false);
        } catch (Exception e) {
            promise.resolve(false);
        }
    }

    private static final String SECURE_PREFS_NAME = "kudicart_driver_secure_prefs";

    @ReactMethod
    public void setSecureItem(String key, String value, Promise promise) {
        try {
            android.content.SharedPreferences prefs = reactContext.getSharedPreferences(SECURE_PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putString(key, value).apply();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("STORAGE_SET_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getSecureItem(String key, Promise promise) {
        try {
            android.content.SharedPreferences prefs = reactContext.getSharedPreferences(SECURE_PREFS_NAME, Context.MODE_PRIVATE);
            String value = prefs.getString(key, null);
            promise.resolve(value);
        } catch (Exception e) {
            promise.reject("STORAGE_GET_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void removeSecureItem(String key, Promise promise) {
        try {
            android.content.SharedPreferences prefs = reactContext.getSharedPreferences(SECURE_PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().remove(key).apply();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("STORAGE_REMOVE_ERROR", e.getMessage());
        }
    }
}

