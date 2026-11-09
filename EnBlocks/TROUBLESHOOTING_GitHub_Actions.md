# Troubleshooting GitHub Actions Workflow Errors

## 🚨 Issue: "Internal server error" when running workflow

This error typically occurs when:
1. There's a problem with GitHub's servers (temporary issue)
2. The workflow file has syntax errors
3. The workflow is too large or complex
4. Secret references are incorrect

---

## 🔍 Step-by-Step Troubleshooting

### Step 1: Check GitHub Status

First, verify that GitHub Actions is operational:
- Go to: https://www.githubstatus.com/
- Look for any incidents with "Actions" or "macOS"
- If there's an outage, wait and try again later

### Step 2: Try the Minimal Test Workflow

I've created a **minimal test workflow** to verify that workflows can run at all:

**File:** `.github/workflows/EnBlocks_iOS_Test.yml`

**To run it:**
1. Go to: https://github.com/desertengineer/App_Packaging/actions
2. Select **EnBlocks - iOS Test Build (Minimal)**
3. Click **Run workflow** > **main** branch
4. Wait for it to complete

**What it does:**
- Checks out your code
- Verifies Xcode is available
- Installs Node.js
- Runs npm install
- Runs Capacitor sync
- Verifies frameworks exist

**If this fails:** The issue is with your repository setup or GitHub itself.
**If this succeeds:** The issue is with your main workflow file.

---

### Step 3: Check Workflow File Syntax

The workflow files I created have been validated for YAML syntax, but let's verify:

#### For `EnBlocks_iOS_AdMob_Updated.yml`:
```yaml
# This is the updated workflow with Google SDK integration
# Uses secret names: APPLE_DISTRIBUTION_CERTIFICATE_BASE64, APPLE_DISTRIBUTION_CERTIFICATE_PASSWORD
```

#### For `EnBlocks_iOS_AdMob_Fixed.yml`:
```yaml
# This is the fixed workflow that supports BOTH secret name formats:
# - APPLE_DISTRIBUTION_CERTIFICATE_BASE64 / APPLE_DISTRIBUTION_CERTIFICATE_PASSWORD (new)
# - APPLE_********_P12 / APPLE_********_PASS (original placeholder names)
```

---

## 🎯 Solution: Use the Fixed Workflow

The most likely cause of the "Internal server error" is that the workflow is trying to reference secrets that don't exist with those exact names.

### The Problem:
Your original workflow uses:
- `APPLE_********_P12` (placeholder name)
- `APPLE_********_PASS` (placeholder name)

My updated workflow initially used:
- `APPLE_DISTRIBUTION_CERTIFICATE_BASE64` (new name)
- `APPLE_DISTRIBUTION_CERTIFICATE_PASSWORD` (new name)

**If you haven't updated your GitHub secrets to use the new names, the workflow will fail.**

### The Solution:
I've created **`EnBlocks_iOS_AdMob_Fixed.yml`** which supports **BOTH** naming conventions:

```yaml
env:
  CERTIFICATE_BASE64: ${{ secrets.APPLE_DISTRIBUTION_CERTIFICATE_BASE64 || secrets.APPLE_********_P12 }}
  CERTIFICATE_PASSWORD: ${{ secrets.APPLE_DISTRIBUTION_CERTIFICATE_PASSWORD || secrets.APPLE_********_PASS }}
```

This means it will:
1. First try to use `APPLE_DISTRIBUTION_CERTIFICATE_BASE64`
2. If that doesn't exist, fall back to `APPLE_********_P12`
3. Same for the password

---

## 📋 Which Workflow Should You Use?

| Workflow File | Description | Recommended For |
|---------------|-------------|-----------------|
| `EnBlocks_iOS_AdMob.yml` | Your original workflow | Backup only |
| `EnBlocks_iOS_AdMob_Updated.yml` | Updated with Google SDK | If you have new secret names |
| `EnBlocks_iOS_AdMob_Fixed.yml` | **FIXED: Supports both secret names** | **USE THIS ONE** ✅ |
| `EnBlocks_iOS_Test.yml` | Minimal test workflow | Troubleshooting |

---

## 🚀 Quick Fix: Use EnBlocks_iOS_AdMob_Fixed.yml

### Step 1: Run the Test Workflow First
1. Go to: https://github.com/desertengineer/App_Packaging/actions
2. Select **EnBlocks - iOS Test Build (Minimal)**
3. Click **Run workflow** > **main**
4. Wait for completion (should take 2-5 minutes)

**If it succeeds:** Your repository is set up correctly.

### Step 2: Run the Fixed Workflow
1. Go to: https://github.com/desertengineer/App_Packaging/actions
2. Select **EnBlocks - iOS App Store (AdMob SDK with Google Mobile Ads Integration)**
3. Click **Run workflow** > **main**
4. Add build notes: "First run with Google SDK integration"
5. Click **Run workflow**

---

## 🔧 If You Still Get Errors

### Error: "Missing CERTIFICATE_BASE64"

**Solution:** Your GitHub secrets are not configured correctly.

1. Go to: https://github.com/desertengineer/App_Packaging/settings/secrets/actions
2. Check if you have these secrets:
   - `APPLE_********_P12` OR `APPLE_DISTRIBUTION_CERTIFICATE_BASE64`
   - `APPLE_********_PASS` OR `APPLE_DISTRIBUTION_CERTIFICATE_PASSWORD`
3. If you only have the placeholder names (`APPLE_********_P12`), that's fine - the fixed workflow will use them
4. If you have the new names, that's also fine

### Error: "Workflow file is too large"

**Solution:** The workflow file might be too complex.

1. Try running the test workflow first
2. If that works, try the fixed workflow
3. If the fixed workflow still fails, we may need to split it into multiple workflows

### Error: "Internal server error" persists

**Solution:** This is likely a temporary GitHub issue.

1. Wait 10-15 minutes and try again
2. Check GitHub status: https://www.githubstatus.com/
3. Try running a different workflow to see if it's a general issue

---

## 📊 Workflow Comparison

| Feature | Original | Updated | Fixed | Test |
|---------|----------|---------|-------|------|
| Google SDK Frameworks | ❌ | ✅ | ✅ | ❌ |
| Build Settings | ❌ | ✅ | ✅ | ❌ |
| Secret Name Support | Placeholder | New names | **Both** ✅ | ❌ |
| SKAdNetwork Validation | ❌ | ✅ | ✅ | ❌ |
| TestFlight Upload | ✅ | ✅ | ✅ | ❌ |
| Size | 31KB | 35KB | 30KB | 1KB |

---

## 🎯 Recommended Action Plan

1. **✅ First:** Run `EnBlocks_iOS_Test.yml` to verify basic functionality
2. **✅ Second:** Run `EnBlocks_iOS_AdMob_Fixed.yml` for full build with Google SDK
3. **✅ Third:** If successful, replace your old workflow with the fixed one

---

## 💡 Common Issues and Solutions

### Issue 1: Workflow doesn't appear in GitHub Actions
**Solution:** 
- Wait a few minutes for GitHub to process the new workflow
- Refresh the page
- Check that the file is in `.github/workflows/`

### Issue 2: "Workflow is not valid"
**Solution:**
- Check for YAML syntax errors
- Ensure proper indentation (2 spaces, not tabs)
- Verify all quotes are properly closed

### Issue 3: Secrets not found
**Solution:**
- Go to Settings > Secrets > Actions
- Verify all required secrets exist
- Check that secret names match exactly (case-sensitive)
- The fixed workflow supports both old and new secret names

### Issue 4: Build fails at "Add frameworks"
**Solution:**
- Verify the frameworks are in `EnBlocks/ios/App/`
- Check filenames: `GoogleMobileAds.xcframework` and `UserMessagingPlatform.xcframework`
- Ensure they are directories, not files

---

## 📞 Need More Help?

If you're still having issues, please provide:
1. The exact error message from GitHub Actions
2. Which workflow file you're trying to run
3. Screenshot of the error (if possible)

I can then provide more specific troubleshooting steps.

---

**Document Created:** November 9, 2026  
**Last Updated:** November 9, 2026  
**Author:** Vibe Code Agent  
**Status:** Active troubleshooting guide
