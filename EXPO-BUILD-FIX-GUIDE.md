# ZestBet Expo Build Fix Guide

## Problem
Your Expo build is failing because JSON files appear to be write-protected, even though they shouldn't be.

## Quick Fix (Run this script)
```bash
chmod +x fix-expo-build.sh
./fix-expo-build.sh
```

## Manual Fix Steps

### 1. Fix File Permissions
```bash
# Remove any file locks (macOS)
sudo chflags nouchg app.json eas.json package.json tsconfig.json

# Remove any file locks (Linux)
sudo chattr -i app.json eas.json package.json tsconfig.json

# Set correct permissions
sudo chmod 644 app.json eas.json package.json tsconfig.json

# Fix ownership
sudo chown $USER:$(id -gn) app.json eas.json package.json tsconfig.json
```

### 2. Fix app.json Configuration Issues

Edit `app.json` and make these changes:

**Change newArchEnabled:**
```json
"newArchEnabled": false,  // Change from true to false
```

**Fix Android permissions (remove duplicates):**
```json
"permissions": [
  "android.permission.CAMERA",
  "android.permission.READ_EXTERNAL_STORAGE", 
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.RECORD_AUDIO"
]
```
Remove these duplicate entries:
- `"CAMERA"`
- `"READ_EXTERNAL_STORAGE"`
- `"WRITE_EXTERNAL_STORAGE"`
- `"RECORD_AUDIO"`

### 3. Clear All Caches
```bash
rm -rf .expo/
rm -rf node_modules/.cache/
rm -rf dist/
rm -rf .expo-shared/
rm -rf .next/
rm -rf .turbo/
```

### 4. Reinstall Dependencies
```bash
# If using bun
bun install --force

# If using npm
npm install --force
```

### 5. Install/Update EAS CLI
```bash
# If using bun
bun add -g @expo/eas-cli

# If using npm
npm install -g @expo/eas-cli
```

### 6. Login to EAS
```bash
eas login
```

### 7. Start Build
```bash
# For iOS
eas build --platform ios --profile production

# For Android  
eas build --platform android --profile production

# For both
eas build --platform all --profile production
```

## Common Issues & Solutions

### "JSON files are read-only" Error
1. Check if your IDE/editor has the files locked
2. Close your IDE completely
3. Run the permission fix commands above
4. Reopen your IDE

### "newArchEnabled" Build Errors
- Make sure `newArchEnabled` is set to `false` in app.json
- The new architecture can cause build issues

### Permission Denied Errors
```bash
# Try with sudo
sudo chmod 644 app.json eas.json package.json
sudo chown $USER app.json eas.json package.json
```

### EAS CLI Not Found
```bash
# Install globally
npm install -g @expo/eas-cli
# or
bun add -g @expo/eas-cli
```

## Verification Commands

Check file permissions:
```bash
ls -la app.json eas.json package.json
```

Check if newArchEnabled is fixed:
```bash
grep "newArchEnabled" app.json
```

Check EAS CLI:
```bash
eas --version
```

## After Fix
Once everything is fixed, you should be able to run:
```bash
eas build --platform all --profile production
```

The build should start without any "read-only" file errors.