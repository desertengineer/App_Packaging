# Fix: xcodeproj new_file Arguments Error

## 🚨 **ERROR IDENTIFIED**

The workflow failed with this error:
```
wrong number of arguments (given 3, expected 1..2) (ArgumentError)
from -:19:in `<main>'
```

---

## 🔍 **THE PROBLEM**

The `new_file` method in the `xcodeproj` Ruby gem has this signature:
```ruby
new_file(path, source_root = nil, file_options = {})
```

It accepts **1-2 arguments**, but the workflow was passing **3 arguments**:

```ruby
❌ WRONG:
gma_file_ref = project.new_file(gma_framework_path, :group, :group)
ump_file_ref = project.new_file(ump_framework_path, :group, :group)
```

The `:group, :group` were being passed as separate arguments instead of as a file_options hash.

---

## ✅ **THE FIX**

Removed the invalid arguments:

```ruby
✅ CORRECT:
gma_file_ref = project.new_file(gma_framework_path)
ump_file_ref = project.new_file(ump_framework_path)
```

**Why this works:**
- The `new_file` method only needs the path to create a file reference
- The `:group` option is not needed for adding framework references
- The xcodeproj gem automatically handles the file type based on the path

---

## 📝 **WHAT WAS CHANGED**

### **Before (Lines 220-227):**
```ruby
# Add frameworks to the project if they don't exist
gma_file_ref = project.reference_for_path(gma_framework_path)
unless gma_file_ref
  gma_file_ref = project.new_file(gma_framework_path, :group, :group)
end

ump_file_ref = project.reference_for_path(ump_framework_path)
unless ump_file_ref
  ump_file_ref = project.new_file(ump_framework_path, :group, :group)
end
```

### **After (Fixed):**
```ruby
# Add frameworks to the project if they don't exist
gma_file_ref = project.reference_for_path(gma_framework_path)
unless gma_file_ref
  gma_file_ref = project.new_file(gma_framework_path)
end

ump_file_ref = project.reference_for_path(ump_framework_path)
unless ump_file_ref
  ump_file_ref = project.new_file(ump_framework_path)
end
```

---

## 🎯 **WHY THIS IS CORRECT**

The `xcodeproj` gem's `new_file` method:
1. Accepts a path (required)
2. Optionally accepts a source_root (not needed here)
3. Optionally accepts file_options hash (not needed here)

For adding XCFrameworks to a project:
- We only need to provide the path
- The gem automatically detects it's a framework
- The gem adds it to the project correctly

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
5. ✅ Adds both frameworks to the App target's framework build phase
6. ✅ Sets both frameworks to **"Embed & Sign"**
7. ✅ Saves the updated project file

---

## 💡 **IF YOU STILL GET ERRORS**

### **Error: "wrong number of arguments"**
**Solution:**
- This should be fixed
- Verify the `new_file` calls only have 1 argument
- Check the workflow file for any remaining invalid calls

### **Error: "Framework not found"**
**Solution:**
- Verify the frameworks exist in `EnBlocks/ios/App/`
- Check filenames: `GoogleMobileAds.xcframework` and `UserMessagingPlatform.xcframework`

### **Error: "Paths must be absolute"**
**Solution:**
- Verify `File.expand_path` is being used
- Check the previous fix was applied

---

## 🎉 **SUCCESS CRITERIA**

The step is successful when:
- ✅ No "wrong number of arguments" error
- ✅ No "Framework not found" error
- ✅ No "Paths must be absolute" error
- ✅ Step completes with green checkmark
- ✅ Output shows: "Added GoogleMobileAds.xcframework and UserMessagingPlatform.xcframework to project"

---

## 📁 **FILES UPDATED**

- **`.github/workflows/EnBlocks_iOS_Custom.yml`** - Fixed new_file method calls

---

## 📞 **NEED HELP?**

If you encounter any other errors:
1. Check the workflow logs in GitHub Actions
2. Review this fix documentation
3. Review previous fix documents:
   - `FIX_WORKFLOW_SYNTAX_ERROR.md`
   - `FIX_XCODEPROJ_PATH_ERROR.md`
4. Ask me for help with the specific error message

---

**Document Created:** November 9, 2026  
**Author:** Vibe Code Agent  
**Fix Applied:** Removed invalid arguments from new_file method calls  
**Status:** ✅ Ready to run  
**Next Step:** Run the fixed workflow from GitHub Actions
