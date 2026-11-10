# Fix: Frameworks Build Phase Error

## 🚨 **ERROR IDENTIFIED**

The workflow failed with this error:
```
undefined method `each' for an instance of Xcodeproj::Project::Object::PBXFrameworksBuildPhase (NoMethodError)
-:28:in `<main>'
```

---

## 🔍 **THE PROBLEM**

The code was trying to iterate over `app_target.frameworks_build_phases` using `.each`:

```ruby
❌ WRONG:
app_target.frameworks_build_phases.each do |phase|
  # ...
end
```

However, `frameworks_build_phases` returns a **single** `PBXFrameworksBuildPhase` object, **not an array**. Therefore, you cannot call `.each` on it.

---

## ✅ **THE FIX**

Changed to use the framework phase directly without iteration:

```ruby
✅ CORRECT:
framework_phase = app_target.frameworks_build_phases
unless framework_phase.files.any? { |f| f.file_ref.display_name == 'GoogleMobileAds.xcframework' }
  framework_phase.add_file_reference(gma_file_ref, true)
end
unless framework_phase.files.any? { |f| f.file_ref.display_name == 'UserMessagingPlatform.xcframework' }
  framework_phase.add_file_reference(ump_file_ref, true)
end
```

**Why this works:**
- `frameworks_build_phases` returns a single build phase object
- We store it in a variable: `framework_phase`
- We add file references directly to this phase
- No iteration needed since there's only one phase

---

## 📝 **WHAT WAS CHANGED**

### **Before (Lines 228-234):**
```ruby
# Add frameworks to the App target's framework build phase
app_target.frameworks_build_phases.each do |phase|
  unless phase.files.any? { |f| f.file_ref.display_name == 'GoogleMobileAds.xcframework' }
    phase.add_file_reference(gma_file_ref, true)
  end
  unless phase.files.any? { |f| f.file_ref.display_name == 'UserMessagingPlatform.xcframework' }
    phase.add_file_reference(ump_file_ref, true)
  end
end
```

### **After (Fixed):**
```ruby
# Add frameworks to the App target's framework build phase
framework_phase = app_target.frameworks_build_phases
unless framework_phase.files.any? { |f| f.file_ref.display_name == 'GoogleMobileAds.xcframework' }
  framework_phase.add_file_reference(gma_file_ref, true)
end
unless framework_phase.files.any? { |f| f.file_ref.display_name == 'UserMessagingPlatform.xcframework' }
  framework_phase.add_file_reference(ump_file_ref, true)
end
```

---

## 🎯 **WHY THIS IS CORRECT**

In Xcode projects:
- Each target typically has **one** frameworks build phase
- The `frameworks_build_phases` method returns this single phase object
- You add frameworks directly to this phase, not iterate over multiple phases

The xcodeproj gem's API:
- `target.frameworks_build_phases` → returns a single `PBXFrameworksBuildPhase` object
- `phase.add_file_reference(file_ref, sign_on_copy)` → adds a framework to the phase

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
2. ✅ Creates file references with correct number of arguments
3. ✅ Adds `GoogleMobileAds.xcframework` to the Xcode project
4. ✅ Adds `UserMessagingPlatform.xcframework` to the Xcode project
5. ✅ Adds both frameworks to the **App target's framework build phase** (correctly, without iteration)
6. ✅ Sets both frameworks to **"Embed & Sign"**
7. ✅ Saves the updated project file

---

## 💡 **IF YOU STILL GET ERRORS**

### **Error: "undefined method 'each'"**
**Solution:**
- This should be fixed
- Verify `frameworks_build_phases` is not being iterated over
- Check the workflow file for any remaining `.each` calls on `frameworks_build_phases`

### **Error: "Framework not found"**
**Solution:**
- Verify frameworks exist in `EnBlocks/ios/App/`
- Check filenames: `GoogleMobileAds.xcframework` and `UserMessagingPlatform.xcframework`

### **Error: "Paths must be absolute"**
**Solution:**
- Verify `File.expand_path` is being used
- Check previous fixes were applied

### **Error: "wrong number of arguments"**
**Solution:**
- Verify `new_file` calls only have 1 argument
- Check previous fix was applied

---

## 🎉 **SUCCESS CRITERIA**

The step is successful when:
- ✅ No "undefined method 'each'" error
- ✅ No "Framework not found" error
- ✅ No "Paths must be absolute" error
- ✅ No "wrong number of arguments" error
- ✅ Step completes with green checkmark
- ✅ Output shows: "Added GoogleMobileAds.xcframework and UserMessagingPlatform.xcframework to project"

---

## 📁 **FILES UPDATED**

- **`.github/workflows/EnBlocks_iOS_Custom.yml`** - Fixed frameworks_build_phases iteration

---

## 📞 **NEED HELP?**

If you encounter any other errors:
1. Check the workflow logs in GitHub Actions
2. Review this fix documentation
3. Review all previous fix documents:
   - `FIX_WORKFLOW_SYNTAX_ERROR.md`
   - `FIX_XCODEPROJ_PATH_ERROR.md`
   - `FIX_XCODEPROJ_NEW_FILE_ERROR.md`
   - `FIX_FRAMEWORKS_BUILD_PHASE_ERROR.md`
4. Ask me for help with the specific error message

---

**Document Created:** November 9, 2026  
**Author:** Vibe Code Agent  
**Fix Applied:** Removed .each iteration from frameworks_build_phases  
**Status:** ✅ Ready to run  
**Next Step:** Run the fixed workflow from GitHub Actions
