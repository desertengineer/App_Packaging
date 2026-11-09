# Step-by-Step Guide: Fix EnBlocks AdMob Integration

## For Novice Users on Windows Desktop

This guide will help you fix your AdMob integration to follow Google's official iOS quick-start guide.

---

## 🚨 IMPORTANT NOTES

1. **You need a Mac to build iOS apps** - Even though you're on Windows, Xcode only runs on Mac
2. **Use GitHub Desktop** - You already have it installed (Version 3.6.5)
3. **All commands** are for Windows Command Prompt or Git Bash
4. **For iOS builds** - You'll need to transfer files to a Mac or use a cloud service

---

# PART 1: Quick Fix (Add Missing SKAdNetworkItems)

## Step 1: Open Info.plist File

1. Open **File Explorer** on your Windows desktop
2. Navigate to: `C:\Users\<YOUR_USERNAME>\App_Packaging\EnBlocks\ios\App\App`
   (or wherever your repository is cloned)
3. Find the file: **Info.plist**
4. Right-click and open with **Notepad** or **Visual Studio Code**

## Step 2: Add SKAdNetworkItems

Find this line in Info.plist:
```xml
	<key>GADApplicationIdentifier</key>
	<string>ca-app-pub-2658659289706339~4005585343</string>
```

**ADD THIS AFTER IT** (copy exactly):

```xml
	<key>SKAdNetworkItems</key>
	<array>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>cstr6suwn9.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>4fzdc2evr5.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>2fnua5tdw4.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>ydx93a7ass.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>p78axxw29g.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>v72qych5uu.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>ludvb6z3bs.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>cp8zw746q7.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>3sh42y64q3.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>c6k4g5qg8m.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>s39g8k73mm.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>wg4vff78zm.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>3qy4746246.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>f38h382jlk.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>hs6bdukanm.skadnetwork</string>
		</dict>
		<dict>
			<key>SKAdNetworkIdentifier</key>
			<string>mlmmfzh3r3.skadnetwork</string>
		</dict>
	</array>
```

## Step 3: Save Info.plist

1. Press **Ctrl + S** to save
2. Close the file

---

# PART 2: Add Ad Unit IDs

## Step 4: Open admob-config.js

1. Navigate to: `EnBlocks\www`
2. Open file: **admob-config.js**

## Step 5: Add Your Ad Unit IDs

Replace the current content with:

```javascript
window.__ADMOB_CONFIG__ = Object.freeze({
    appId: 'ca-app-pub-2658659289706339~4005585343',
    appOpen: '',
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    nativeAdvanced: '',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
    rewardedInterstitial: ''
});
```

**Note**: These are Google's **TEST** ad unit IDs. They will show test ads. Replace with your real AdMob ad unit IDs when ready for production.

## Step 6: Save admob-config.js

1. Press **Ctrl + S** to save
2. Close the file

---

# PART 3: Initialize SDK in AppDelegate (Optional but Recommended)

## Step 7: Open AppDelegate.swift

1. Navigate to: `EnBlocks\ios\App\App`
2. Open file: **AppDelegate.swift**

## Step 8: Add SDK Initialization

Find this line:
```swift
import UIKit
import Capacitor
```

**CHANGE TO** (add GoogleMobileAds):
```swift
import UIKit
import Capacitor
import GoogleMobileAds
```

Then find this function:
```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Override point for customization after application launch.
    return true
}
```

**CHANGE TO**:
```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Initialize Google Mobile Ads SDK
    MobileAds.shared.start()
    
    // Override point for customization after application launch.
    return true
}
```

## Step 9: Save AppDelegate.swift

1. Press **Ctrl + S** to save
2. Close the file

---

# PART 4: Add Required Frameworks to Xcode Project

## Step 10: Copy Frameworks to Xcode Project

1. Open **File Explorer**
2. Navigate to: `App_Packaging\GoogleMobileAdsSdkiOS-13.12.0`
3. Copy these two folders:
   - `GoogleMobileAds.xcframework`
   - `UserMessagingPlatform.xcframework`

4. Navigate to: `App_Packaging\EnBlocks\ios\App`
5. Paste the two folders here

## Step 11: Update Xcode Project (On Mac)

**You need a Mac for this step. If you don't have one, skip to PART 5.**

1. Open the EnBlocks project in **Xcode** on your Mac
2. In Xcode, go to: **File > Add Files to "App"**
3. Select both xcframework folders you just copied
4. Make sure these options are checked:
   - [x] Copy items if needed
   - [x] Create folder references
   - [x] Add to targets: App
5. Click **Add**

6. Select your **App target** in Xcode
7. Go to: **General > Frameworks, Libraries, and Embedded Content**
8. Find both frameworks in the list
9. For each, change the dropdown to: **Embed & Sign**

10. Go to: **Build Settings**
11. Search for "Runpath Search Paths"
12. Click the **+** button
13. Add: `/usr/lib/swift`

14. Search for "Other Linker Flags"
15. Click the **+** button
16. Add: `-ObjC`

17. Press **Cmd + B** to build and verify no errors

---

# PART 5: Sync and Test

## Step 12: Sync Capacitor

Open **Command Prompt** or **Git Bash** on Windows:

```bash
cd C:\Users\<YOUR_USERNAME>\App_Packaging\EnBlocks
npx cap sync ios
```

This will copy your web files to the iOS project.

## Step 13: Commit Changes to GitHub

1. Open **GitHub Desktop**
2. You should see your changes:
   - Modified: Info.plist
   - Modified: admob-config.js
   - Modified: AppDelegate.swift
   - Added: GoogleMobileAds.xcframework (if you copied it)
   - Added: UserMessagingPlatform.xcframework (if you copied it)

3. In the bottom left, enter a commit message:
   ```
   Fix AdMob integration - Add SKAdNetworkItems and test ad units
   ```

4. Click **Commit to main**
5. Click **Push origin** to upload to GitHub

---

# PART 6: Build and Test (On Mac)

## Step 14: Open in Xcode

1. On your Mac, clone the repository or pull the latest changes
2. Navigate to: `App_Packaging/EnBlocks`
3. Open the **ios** folder
4. Double-click: **App.xcworkspace**

## Step 15: Build and Run

1. Select a **simulator** (iPhone 15 or similar)
2. Press **Cmd + R** to build and run
3. Wait for the app to launch
4. Verify:
   - App launches without errors
   - Banner ads appear at the bottom (if configured)
   - No error messages in Xcode console

## Step 16: Test Ads

1. In your app, trigger ad displays:
   - Banner ads should appear automatically
   - Interstitial ads (if you have a trigger button)
   - Rewarded ads (if you have a trigger button)

2. **Expected behavior with test IDs:**
   - You'll see **Test Ad** labels on all ads
   - Ads will load successfully
   - No real ads will be shown (only test ads)

---

# PART 7: Switch to Production (When Ready)

## Step 17: Get Your Real Ad Unit IDs

1. Go to: https://apps.admob.com
2. Sign in with your Google account
3. Select your app: **Magic Block Blitz 2026**
4. Go to: **Ad units**
5. Create ad units for:
   - Banner
   - Interstitial
   - Rewarded

## Step 18: Update admob-config.js with Production IDs

Replace the test IDs with your real ones:

```javascript
window.__ADMOB_CONFIG__ = Object.freeze({
    appId: 'ca-app-pub-2658659289706339~4005585343',
    appOpen: 'ca-app-pub-2658659289706339/XXXXXXXXXX',
    banner: 'ca-app-pub-2658659289706339/XXXXXXXXXX',
    interstitial: 'ca-app-pub-2658659289706339/XXXXXXXXXX',
    nativeAdvanced: '',
    rewarded: 'ca-app-pub-2658659289706339/XXXXXXXXXX',
    rewardedInterstitial: ''
});
```

Replace `XXXXXXXXXX` with your actual ad unit IDs from AdMob.

## Step 19: Test Again

1. Commit and push changes
2. Build on Mac
3. Test thoroughly
4. Verify real ads appear (not test ads)

---

# Troubleshooting

## Problem: Ads not showing

**Check:**
1. Did you add SKAdNetworkItems to Info.plist?
2. Do you have valid ad unit IDs?
3. Are you using test IDs during development?
4. Is the Capacitor AdMob plugin properly installed?

## Problem: Build errors in Xcode

**Check:**
1. Did you add both xcframeworks?
2. Are they set to "Embed & Sign"?
3. Did you add `/usr/lib/swift` to Runpath Search Paths?
4. Did you add `-ObjC` to Other Linker Flags?

## Problem: App crashes on launch

**Check:**
1. Did you add `import GoogleMobileAds` to AppDelegate.swift?
2. Did you call `MobileAds.shared.start()`?
3. Are all frameworks properly linked?

---

# Summary of Changes Made

| File | Change | Status |
|------|--------|--------|
| Info.plist | Added SKAdNetworkItems | ✅ Required |
| admob-config.js | Added test ad unit IDs | ✅ Required |
| AppDelegate.swift | Added SDK initialization | ⚠️ Recommended |
| Xcode Project | Added frameworks | ⚠️ Recommended |

---

# Next Steps

1. ✅ Complete PART 1-3 on Windows
2. ⏳ Complete PART 4 on Mac (if available)
3. ✅ Commit changes to GitHub
4. ⏳ Build and test on Mac
5. ⏳ Switch to production ad units when ready

---

**Guide Version**: 1.0  
**Date**: November 9, 2026  
**For**: EnBlocks (Magic Block Blitz 2026)  
**Author**: Vibe Code Agent
