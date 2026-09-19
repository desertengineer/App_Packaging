Title: Central Monorepo Registry & Routing System

Please index the core layout and routing parameters of our global multi-app packaging engine ('App_Packaging'). Treat this file as the structural registry for managing our expanding game portfolio.

1. High-Level Monorepo Layout:
   - Root Folder: App_Packaging
   - Engine Directories: 
     - `.github/workflows/` (Centralized GitHub actions storage)
     - `assets/` (Shared global media assets)

2. Core Project Registry Index:
   - Current Projects Map:
     * App ID: "EnBlocks" -> Path: `./EnBlocks/`
     * App ID: "EnTiles2048" -> Path: `./EnTiles2048/`
   - Future Scalability Rule: New application directories added to the root directory must be mapped to this directory index before generating pipelines.

3. Shared Global Variables & Parameters:
   - ACCOUNT_EMAIL: info@bekeiratsoftwares.com
   - SUPPORT_EMAIL: support@bekeiratsoftwares.com
   - DEVELOPER_WEBSITE: https://bekeiratsoftwares.com

4. Strict Project Partitioning Mandate:
   - Every application under this registry operates within its own sandbox. 
   - Never mix, leak, or bleed configuration data, workflow environments, bundle IDs, or variables between different registered applications.
