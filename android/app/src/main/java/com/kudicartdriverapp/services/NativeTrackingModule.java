package com.kudicartdriverapp.services;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.speech.tts.TextToSpeech;
import androidx.core.content.ContextCompat;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Locale;

public class NativeTrackingModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    private TextToSpeech textToSpeech;
    private boolean ttsReady = false;

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

    private android.content.SharedPreferences getEncryptedPrefs() throws Exception {
        androidx.security.crypto.MasterKey masterKey =
                new androidx.security.crypto.MasterKey.Builder(reactContext)
                        .setKeyScheme(androidx.security.crypto.MasterKey.KeyScheme.AES256_GCM)
                        .build();
        return androidx.security.crypto.EncryptedSharedPreferences.create(
                reactContext,
                SECURE_PREFS_NAME,
                masterKey,
                androidx.security.crypto.EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                androidx.security.crypto.EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        );
    }

    @ReactMethod
    public void setSecureItem(String key, String value, Promise promise) {
        try {
            android.content.SharedPreferences prefs = getEncryptedPrefs();
            prefs.edit().putString(key, value).apply();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("STORAGE_SET_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getSecureItem(String key, Promise promise) {
        try {
            android.content.SharedPreferences prefs = getEncryptedPrefs();
            String value = prefs.getString(key, null);
            promise.resolve(value);
        } catch (Exception e) {
            promise.reject("STORAGE_GET_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void removeSecureItem(String key, Promise promise) {
        try {
            android.content.SharedPreferences prefs = getEncryptedPrefs();
            prefs.edit().remove(key).apply();
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("STORAGE_REMOVE_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void speakInstruction(String text, Promise promise) {
        try {
            if (text == null || text.trim().isEmpty()) {
                promise.resolve(false);
                return;
            }
            if (textToSpeech == null) {
                textToSpeech = new TextToSpeech(reactContext, status -> {
                    if (status == TextToSpeech.SUCCESS) {
                        textToSpeech.setLanguage(Locale.US);
                        ttsReady = true;
                        textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "kudi_nav_step");
                    }
                });
                promise.resolve(true);
                return;
            }
            if (ttsReady) {
                textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "kudi_nav_step");
                promise.resolve(true);
            } else {
                promise.resolve(false);
            }
        } catch (Exception e) {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void stopSpeech(Promise promise) {
        try {
            if (textToSpeech != null) {
                textToSpeech.stop();
            }
            promise.resolve(true);
        } catch (Exception e) {
            promise.resolve(false);
        }
    }
}

