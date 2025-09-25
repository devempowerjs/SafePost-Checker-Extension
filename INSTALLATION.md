# SafePost Checker - Installation Guide

## Quick Installation (Development)

### Chrome / Edge / Brave
1. Open `chrome://extensions/` (or `edge://extensions/` for Edge)
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the SafePost extension folder
5. The extension icon should appear in your toolbar

### Firefox
1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Navigate to the extension folder and select `manifest.json`
5. The extension will be loaded temporarily

### Safari (macOS)
1. Open Safari
2. Go to Safari > Preferences > Advanced
3. Check "Show Develop menu in menu bar"
4. In Develop menu, select "Allow Unsigned Extensions"
5. Go to Safari > Preferences > Extensions
6. Click the "+" button and select the extension folder

## Features to Test

After installation, test these features:

### 1. Real-time Detection
- Go to any website with text input
- Type: "My phone number is 555-123-4567"
- Should see a privacy alert

### 2. Form Protection
- Try to submit a form with sensitive data
- Extension should prevent submission and show alert

### 3. Photo Upload Alert
- Try to upload any image file
- Should receive a photo sharing alert

### 4. Social Media Protection
- Visit Facebook, Twitter, or Instagram
- Try typing personal information in a post
- Enhanced monitoring should activate

### 5. Privacy Tools
- Click the extension icon
- Test privacy tools in the Privacy tab
- Clear history and manage cookies

### 6. Settings
- Customize detection types
- Adjust sensitivity levels
- Toggle extension on/off

## Troubleshooting

### Extension Not Working
- Make sure "Developer mode" is enabled
- Refresh the page after installing
- Check browser console for errors

### Alerts Not Showing
- Verify extension is enabled in settings
- Check that detection types are enabled
- Try on a different website

### Permission Issues
- Ensure extension has necessary permissions
- Some browsers may require manual permission grants

## Distribution (Production)

### Chrome Web Store
1. Create developer account
2. Package extension as .zip
3. Submit for review
4. Follow Chrome Web Store policies

### Firefox Add-ons
1. Create Mozilla developer account
2. Submit extension to addons.mozilla.org
3. Follow Mozilla review process

### Edge Add-ons
1. Use same package as Chrome
2. Submit to Microsoft Edge Add-ons store

## Security Notes

- Extension only processes data locally
- No network requests or data transmission
- All source code is transparent and auditable
- Follows browser security best practices