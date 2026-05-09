# ⚙️ BoxStar SETUP
**Fill in the blanks to activate your Sovereign Pipeline.**

This page is your local configuration manifest. Provide these values to your agent to complete the integration.

---

## 📡 1. Network & Connection
*   **PROJECT-NAME**: __________________________ (e.g., GothTag, SkyRace)
*   **TEAM-NETWORK**: __________________________ (e.g., Tailscale, VPN Name)
*   **PRIMARY-PORT**: __________________________ (Default: 7777 or 34872)
*   **REPO-URL**: ______________________________ (Your GitHub/GitLab URL)

## 👤 2. The Collaborators
*   **COLLABORATOR-A (HQ)**: ____________________ (e.g., Lead Architect)
*   **COLLABORATOR-A-IP**: _____________________ (Tailscale/Local IP)
*   **COLLABORATOR-B (SCOUT)**: ________________ (e.g., Lead Designer)
*   **COLLABORATOR-B-IP**: _____________________ (Tailscale/Local IP)

## 🚀 3. Branching & Conventions
*   **BRANCH-CONVENTION-A**: `feat/[NAME]-[DATE]-[TIME]`
*   **BRANCH-CONVENTION-B**: `feat/[NAME]-[DATE]-[TIME]`
*   **SUBMIT-SCRIPT**: _________________________ (Default: sovereign-submit)

---

## ✅ Activation Command
Once the above is filled, tell your agent:
> "I have my SETUP values ready. Update the Scaffolds in `/boxstar-scaffolds-v0.1` with my PROJECT-NAME, IPs, and Ports. Let's move to Stage 1: Ingestion."
