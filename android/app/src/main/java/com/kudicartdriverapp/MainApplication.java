package com.kudicartdriverapp;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          packages.add(new com.kudicartdriverapp.services.NativeTrackingPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }
    ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    createNotificationChannels();
  }

  private void createNotificationChannels() {
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
      android.app.NotificationManager manager = getSystemService(android.app.NotificationManager.class);
      if (manager != null) {
        // 1. Critical Driver Urgent Alerts & Assignments
        android.app.NotificationChannel alertsChannel = new android.app.NotificationChannel(
          "affordz_critical_alerts",
          "KudiCart Driver Urgent Alerts",
          android.app.NotificationManager.IMPORTANCE_HIGH
        );
        alertsChannel.setDescription("Urgent delivery assignments and order status updates");
        alertsChannel.enableLights(true);
        alertsChannel.enableVibration(true);
        alertsChannel.setShowBadge(true);
        manager.createNotificationChannel(alertsChannel);

        // 2. Driver Order & Shift Notifications
        android.app.NotificationChannel driverChannel = new android.app.NotificationChannel(
          "kudicart_driver_alerts",
          "KudiCart Driver Assignments",
          android.app.NotificationManager.IMPORTANCE_HIGH
        );
        driverChannel.setDescription("New order offers and delivery status notifications");
        driverChannel.enableLights(true);
        driverChannel.enableVibration(true);
        driverChannel.setShowBadge(true);
        manager.createNotificationChannel(driverChannel);
      }
    }
  }
}
