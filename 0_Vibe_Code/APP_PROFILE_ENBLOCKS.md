Title: Application Context Profile: EnBlocks (Magic Block Blitz 2026)

Please link this application profile to the 'EnBlocks' registration record in our central monorepo registry. Use these variables for any task targeting this app:

1. Folder Mappings & Targets:
   - Application Directory: `EnBlocks/`
   - Target Workflow File: `App_Packaging/.github/workflows/EnBlocks_ios AdMob.yml`
   - GitHub Target Environment: `MagicBlockBlitz-Environment`

2. App Identification Metadata:
   - App Name: Magic Block Blitz 2026
   - Capacitor App Name: EnBlocks
   - Bundle Identifier: com.bekeiratapps.magicblockblitz2026
   - Xcode Scheme: App
   - Primary Category: Games / Puzzle / Strategy
   - Subtitle: Block Puzzle & Grid Strategy
   - SKU: EnBlocks

3. Code Signing Credentials (Apple Distribution):
   - APPLE_DEVELOPER_TEAM_ID: XHNXQ72KYZ
   - APPLE_TEAM_NAME: Moulay Bukayrat

4. Operational Pipeline Rules:
   - When running compilation or automated updates targeting this profile, pass the above parameters dynamically. 
   - Ensure the build execution maps to the 'MagicBlockBlitz-Environment' pool to successfully resolve matching variables and secret keys.
