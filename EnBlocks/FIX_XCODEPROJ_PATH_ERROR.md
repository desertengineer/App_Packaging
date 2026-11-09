# Fix: xcodeproj Path Error

## 🚨 **ERROR IDENTIFIED**

The workflow failed with this error:
```
Paths must be absolute ../GoogleMobileAds.xcframework (ArgumentError)
raise ArgumentError, "Paths must be absolute #{absolute_path}"
```

---

## 🔍 **THE PROBLEM**

The `xcodeproj` Ruby gem requires **absolute file paths** when adding files to an Xcode project. The workflow was using **relative paths**:

```ruby
❌ WRONG:
gma_framework_path = '../GoogleMobileAds.xcframework'
ump_framework_path = '../UserMessagingPlatform.xcframework'
```

The `reference_for_path` and `new_file` methods in the xcodeproj gem **only accept absolute paths**, not relative paths.

---

## ✅ **THE FIX**

Changed to use **absolute paths** by using `File.expand_path`:

```ruby
✅ CORRECT:
require 'pathname'

gma_framework_path = File.expand_path('GoogleMobileAds.xcframework')
ump_framework_path = File.expand_path('UserMessagingPlatform.xcframework')
```

**Why this works:**
- `File.expand_path` converts a relative path to an absolute path
- It uses the current working directory as the base
- The working directory is `TARGET_DIR/ios/App` (where the Xcode project is)
- The frameworks are in the same directory: `TARGET_DIR/ios/App/GoogleMobileAds.xcframework`
- So `File.expand_path('GoogleMobileAds.xcframework')` resolves to the full absolute path

---

## 📝 **WHAT WAS CHANGED**

### **Before (Lines 215-217):**
```ruby
# Framework paths relative to project directory
gma_framework_path = '../GoogleMobileAds.xcframework'
ump_framework_path = '../UserMessagingPlatform.xcframework'
```

### **After (Fixed):**
```ruby
# Framework paths - use absolute paths as required by xcodeproj
# The frameworks are in the same directory as the Xcode project
require 'pathname'
gma_framework_path = File.expand_path('GoogleMobileAds.xcframework')
ump_framework_path = File.expand_path('UserMessagingPlatform.xcframework')
```

---

## 🎯 **WHY THIS IS THE CORRECT PATH**

Your directory structure:
```
EnBlocks/
├── ios/
│   └── App/
│       ├── App.xcodeproj/          ← Xcode project
│       ├── GoogleMobileAds.xcframework/  ← Framework 1
│       └── UserMessagingPlatform.xcframework/  ← Framework 2
```

The workflow runs in: `TARGET_DIR/ios/App` = `EnBlocks/ios/App`

Therefore:
- `GoogleMobileAds.xcframework` (relative path) = `EnBlocks/ios/App/GoogleMobileAds.xcframework` (absolute path)
- `UserMessagingPlatform.xcframework` (relative path) = `EnBlocks/ios/App/UserMessagingPlatform.xcframework` (absolute path)

**Note:** The frameworks are in the **same directory** as the Xcode project, not in a parent directory. So we don't need `../` at all!

---

## 🚀 **HOW TO RUN THE FIXED WORKFLOW**

### **Step 1: Wait for GitHub to Process**
- The fix has been committed and pushed to GitHub
- Wait 1-2 minutes for GitHub to process the changes

### **Step 2: Run the Custom Workflow**
1. Go to: https://github.com/desertengineer/App_Packaging/actions
2. Select: **EnBlocks - iOS App Store (Custom - Google Mobile Ads SDK)**
3. Click: **Run workflow** > **main** branch
4. Click: **Run workflow**

### **Step 3: Monitor the Build**
- ✅ The "Add Google Mobile Ads SDK frameworks" step should now succeed
- ✅ All 31 steps should execute without errors
- ⏱️ Build time: 15-20 minutes (first time)

---

## 📊 **WHAT THE FIXED STEP DOES**

The "Add Google Mobile Ads SDK frameworks to Xcode project" step now:

1. ✅ Uses absolute paths for framework references
2. ✅ Adds `GoogleMobileAds.xcframework` to the Xcode project
3. ✅ Adds `UserMessagingPlatform.xcframework` to the Xcode project
4. ✅ Adds both frameworks to the App target's framework build phase
5. ✅ Sets both frameworks to **"Embed & Sign"**
6. ✅ Saves the updated project file

---

## 💡 **IF YOU STILL GET ERRORS**

### **Error: "Framework not found"**
**Solution:**
- Verify the frameworks exist in `EnBlocks/ios/App/`
- Check that the filenames are exactly:
  - `GoogleMobileAds.xcframework`
  - `UserMessagingPlatform.xcframework`
- Ensure they are directories, not files

### **Error: "Paths must be absolute"**
**Solution:**
- This should be fixed, but if it persists:
- Check that `File.expand_path` is being used
- Verify the working directory is correct

### **Error: "No such file or directory"**
**Solution:**
- The frameworks might not be in the expected location
- Move them to: `EnBlocks/ios/App/`
- Ensure the filenames match exactly

---

## 🎉 **SUCCESS CRITERIA**

The step is successful when:
- ✅ No "Paths must be absolute" error
- ✅ No "Framework not found" error
- ✅ Step completes with green checkmark
- ✅ Output shows: "Added GoogleMobileAds.xcframework and UserMessagingPlatform.xcframework to project"

---

## 📁 **FILES UPDATED**

- **`.github/workflows/EnBlocks_iOS_Custom.yml`** - Fixed framework path references

---

## 📞 **NEED HELP?**

If you encounter any other errors:
1. Check the workflow logs in GitHub Actions
2. Review this fix documentation
3. Ask me for help with the specific error message

---

**Document Created:** November 9, 2026  
**Author:** Vibe Code Agent  
**Fix Applied:** Changed relative paths to absolute paths using File.expand_path  
**Status:** ✅ Ready to run  
**Next Step:** Run the fixed workflow from GitHub Actions
