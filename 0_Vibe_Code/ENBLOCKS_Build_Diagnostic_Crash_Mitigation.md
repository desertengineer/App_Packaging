Title: Diagnose iOS Workflow Compilation Failure (CapacitorCommunityAdmob)

We have an active build blocker in our automated packaging pipeline that needs optimization. Inspect these diagnostic boundaries and await instructions:

1. Environment Constraints:
   - Local Machine: Windows environment. We do not have local macOS or Xcode setups.
   - Restricted Commands (Must NEVER be run locally on Windows; they must run solely on the `macos-15` runner): `pod install`, `xcodebuild`, `codesign`, `security import`, etc.
   - Allowed Local Checks on Windows: `npm ci`, `npx cap sync ios`, `git status`.

2. Current Error Status:
   - Pipeline Progress: The workflow syncs, sets up manual signing configs on the native target, and successfully calls `xcodebuild archive`.
   - Point of Failure: The build crashes during the 'CompileSwift normal arm64' step specifically while trying to compile the module `CapacitorCommunityAdmob`.
   - Exit Code: Terminated with process exit code 65.

3. AdMob Identifier Mapping Constraints:
   - JavaScript runtime depends on the exact execution order inside `www/index.html`: `admob-config.js` MUST load strictly before `index.js`. Do not reverse this.
   - Build-time Placeholders: `capacitor.config.json` uses "REPLACE_AT_BUILD_TIME" for appId, which is dynamically populated by the GitHub action using `secrets.ADMOB_APP_ID`.

4. Immediate Action Required:
   - The current logs mask the true root cause because they only show the final summary line.
   - Update the workflow diagnostic step to insert the following snippet right below the archive failure phase to print the explicit Swift compiler diagnostics with context:
     
     echo "===== SWIFT ERRORS WITH CONTEXT ====="
     grep -n -C 20 -E "error:|fatal error:" "\$log_path" || true
     tail -n 300 "\$log_path"

Implement this log expansion patch in our build workflow so we can pinpoint the underlying CocoaPod or Swift compatibility issue.
