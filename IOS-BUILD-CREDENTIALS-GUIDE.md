# iOS Build Credentials Configuration Guide

## Your Apple Developer Information
- **Apple Team ID**: `RLFRGC9727`
- **Apple ID**: `erhan.berse@googlemail.com`
- **App Store Connect App ID**: `6749276092`
- **Bundle Identifier**: `app.rork.zestbet-global`

## Option 1: Automatic Configuration (Recommended)

Run the provided script to automatically configure your credentials:

```bash
# Make the script executable
chmod +x configure-ios-credentials.sh

# Run the configuration script
./configure-ios-credentials.sh
```

## Option 2: Manual EAS Configuration

If you prefer to configure manually, update your `eas.json` file:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium",
        "appleTeamId": "RLFRGC9727"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium",
        "buildConfiguration": "Release",
        "appleTeamId": "RLFRGC9727"
      }
    }
  }
}
```

## Option 3: EAS Credentials Command

Use EAS CLI to manage credentials interactively:

```bash
# Install EAS CLI if not already installed
npm install -g @expo/eas-cli

# Login to your Expo account
eas login

# Configure credentials interactively
eas credentials
```

## Building Your App

After configuring credentials, you can build your app:

### Preview Build (Internal Testing)
```bash
eas build --platform ios --profile preview
```

### Production Build (App Store)
```bash
eas build --platform ios --profile production
```

## Troubleshooting

### If you get "No credentials found" error:
1. Make sure you're logged into the correct Expo account
2. Verify your Apple Team ID is correct
3. Run `eas credentials` to set up credentials manually

### If you get "Invalid bundle identifier" error:
1. Make sure your bundle identifier `app.rork.zestbet-global` is registered in your Apple Developer account
2. Check that the App ID matches your App Store Connect app

### If you get "Provisioning profile" errors:
1. EAS will automatically create provisioning profiles
2. Make sure your Apple Developer account has the necessary permissions
3. You may need to accept agreements in your Apple Developer account

## Next Steps After Successful Build

1. **Test the build**: Download and test the build on a physical device
2. **Submit to App Store**: Use `eas submit --platform ios --profile production`
3. **Monitor build status**: Check build progress at https://expo.dev/accounts/zestbet/projects/zestapp/builds

## Important Notes

- Your app is configured for production deployment
- All necessary permissions and configurations are already set
- The build will use your Apple Developer account credentials
- Make sure your Apple Developer account is in good standing

## Support

If you encounter any issues:
1. Check the EAS build logs for detailed error messages
2. Verify all credentials are correct
3. Ensure your Apple Developer account has active membership
4. Contact Expo support if needed