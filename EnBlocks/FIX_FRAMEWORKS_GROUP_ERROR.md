# Fix: Frameworks Group Error

## 🚨 **ERROR IDENTIFIED**

The workflow failed with this error:
```
undefined method `frameworks_groups' for an instance of Xcodeproj::Project (NoMethodError)
Did you mean?  frameworks_group
```

---

## 🔍 **THE PROBLEM**

The code was using the wrong method name:

```ruby
❌ WRONG:
project.frameworks_groups.each do |group|
  # ...
end
```

The xcodeproj gem uses **singular** `frameworks_group`, not **plural** `frameworks_groups`.

---

## ✅ **THE FIX**

Changed to use the correct method name:

```ruby
✅ CORRECT:
frameworks_group = project.frameworks_group
frameworks_group.children.each do |child|
  if child.display_name == 'GoogleMobileAds.xcframework' || child.display_name == 'UserMessagingPlatform.xcframework'
    child.settings = { 'ATTRIBUTES' => ['CodeSignOnCopy', 'RemoveHeadersOnCopy'] }
  end
end
```

**Why this works:**
- The xcodeproj gem API uses `frameworks_group` (singular) to access the frameworks group
- This returns a single `PBXGroup` object representing the Frameworks group in Xcode
- We can then iterate over its `children` to find and configure the frameworks

---

## 📝 **WHAT WAS CHANGED**

### **Before (Lines 236-241):**
```ruby
# Set frameworks to Embed & Sign
project.frameworks_groups.each do |group|
  group.children.each do |child|
    if child.display_name == 'GoogleMobileAds.xcframework' || child.display_name == 'UserMessagingPlatform.xcframework'
      child.settings = { 'ATTRIBUTES' => ['CodeSignOnCopy', 'RemoveHeadersOnCopy'] }
    end
  end
end
```

### **After (Fixed):**
```ruby
# Set frameworks to Embed & Sign
frameworks_group = project.frameworks_group
frameworks_group.children.each do |child|
  if child.display_name == 'GoogleMobileAds.xcframework' || child.display_name == 'UserMessagingPlatform.xcframework'
    child.settings = { 'ATTRIBUTES' => ['CodeSignOnCopy', 'RemoveHeadersOnCopy'] }
  end
end
```

---

## 🎯 **WHY THIS IS CORRECT**

In the xcodeproj gem:
- `project.frameworks_group` → returns the Frameworks group (singular)
- `frameworks_group.children` → returns an array of all files in that group
- We iterate over the children to find our frameworks
- We set the `ATTRIBUTES` to `['CodeSignOnCopy', 'RemoveHeadersOnCopy']` which means "Embed & Sign"

The error message was helpful: "Did you mean? frameworks_group" - this is Ruby telling us the correct method name!

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

1. ✅ Uses **absolute paths** for framework references
2. ✅ Creates file references with **correct number of arguments**
3. ✅ Adds `GoogleMobileAds.xcframework` to the Xcode project
4. ✅ Adds `UserMessagingPlatform.xcframework` to the Xcode project
5. ✅ Adds both frameworks to the **App target's framework build phase**
6. ✅ Sets both frameworks to **"Embed & Sign"** using the correct `frameworks_group` method
7. ✅ Saves the updated project file

---

## 💡 **IF YOU STILL GET ERRORS**

### **Error: "undefined method 'frameworks_groups'"**
**Solution:**
- This should be fixed
- Verify `frameworks_group` (singular) is being used
- Check the workflow file for any remaining `frameworks_groups` (plural)

### **Error: "Framework not found"**
**Solution:**
- Verify frameworks exist in `EnBlocks/ios/App/`
- Check filenames: `GoogleMobileAds.xcframework` and `UserMessagingPlatform.xcframework`

### **Error: "Paths must be absolute"**
**Solution:**
- Verify `File.expand_path` is being used

### **Error: "wrong number of arguments"**
**Solution:**
- Verify `new_file` calls only have 1 argument

### **Error: "undefined method 'each'"**
**Solution:**
- Verify `frameworks_build_phases` is not being iterated over

---

## 🎉 **SUCCESS CRITERIA**

The step is successful when:
- ✅ No "undefined method 'frameworks_groups'" error
- ✅ No "Framework not found" error
- ✅ No "Paths must be absolute" error
- ✅ No "wrong number of arguments" error
- ✅ No "undefined method 'each'" error
- ✅ Step completes with green checkmark
- ✅ Output shows: "Added GoogleMobileAds.xcframework and UserMessagingPlatform.xcframework to project"

---

## 📁 **FILES UPDATED**

- **`.github/workflows/EnBlocks_iOS_Custom.yml`** - Fixed frameworks_group method name

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
   - `FIX_FRAMEWORKS_GROUP_ERROR.md`
4. Ask me for help with the specific error message

---

**Document Created:** November 9, 2026  
**Author:** Vibe Code Agent  
**Fix Applied:** Changed frameworks_groups to frameworks_group (singular)  
**Status:** ✅ Ready to run  
**Next Step:** Run the fixed workflow from GitHub Actions
