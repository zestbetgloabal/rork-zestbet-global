# Production Readiness Fix Guide

## Critical Issues Fixed

### 1. EAS Configuration Issues
The main build failures are due to:
- Invalid Android package name format
- Duplicate permissions in Android config
- Outdated dependencies
- Multiple lock files

### 2. Required Manual Fixes

#### Fix app.json (Critical - Must be done manually):
```json
{
  "expo": {
    "name": "ZestBet Global",
    "slug": "zestapp",
    "version": "1.0.1",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.rork.zestbetglobal",
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Allow $(PRODUCT_NAME) to access your photos",
        "NSCameraUsageDescription": "Allow $(PRODUCT_NAME) to access your camera",
        "NSMicrophoneUsageDescription": "Allow $(PRODUCT_NAME) to access your microphone",
        "ITSAppUsesNonExemptEncryption": false
      },
      "usesIcloudStorage": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.rork.zestbetglobal",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.RECORD_AUDIO"
      ]
    },
    "web": {
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://rork.com/"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you share them with your friends."
        }
      ],
      [
        "expo-document-picker",
        {
          "iCloudContainerEnvironment": "Production"
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera",
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone",
          "recordAudioAndroid": true
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "sdkVersion": "53.0.0",
    "platforms": [
      "ios",
      "android",
      "web"
    ],
    "extra": {
      "router": {
        "origin": "https://rork.com/"
      },
      "eas": {
        "projectId": "ac2061c1-c033-49f1-b78a-7bd13067e86f"
      }
    },
    "owner": "wettapp"
  }
}
```

#### Key Changes Made:
1. **Fixed Android package**: Changed from `app.rork.zestbet-global` to `com.rork.zestbetglobal` (proper reverse DNS)
2. **Fixed iOS bundle**: Changed from `app.rork.zestbet-global` to `com.rork.zestbetglobal` (consistent naming)
3. **Removed duplicate permissions**: Cleaned up Android permissions array
4. **Removed package-lock.json**: Only keep bun.lock for consistency

### 3. EAS Build Configuration
Your current eas.json is correct. The build failures are due to:

1. **App Store Connect API Key Missing**: You need to set up ASC API key for automatic submission
2. **Credentials Setup**: iOS credentials are set up but ASC API key is missing

### 4. Manual Steps Required:

#### Step 1: Update app.json
Replace your current app.json with the fixed version above.

#### Step 2: Update Dependencies (Run these commands):
```bash
npx expo install --check
npx expo install --fix
```

#### Step 3: Set up App Store Connect API Key
```bash
eas credentials:configure --platform ios
```
Select "App Store Connect API Key" and follow the prompts.

#### Step 4: Clean Build
```bash
eas build --platform ios --profile production --clear-cache
```

### 5. Production Checklist Status:

✅ **Fixed Issues:**
- EAS project ID matches
- Owner configuration correct
- iOS credentials configured
- Build profiles set up

❌ **Remaining Issues:**
- Android package name format (fixed in guide above)
- Duplicate permissions (fixed in guide above)
- Outdated dependencies (need manual update)
- App Store Connect API key missing

### 6. Next Steps:
1. Apply the app.json changes manually
2. Run dependency updates
3. Set up ASC API key
4. Test build again

The app is very close to production-ready. These fixes should resolve all build issues.