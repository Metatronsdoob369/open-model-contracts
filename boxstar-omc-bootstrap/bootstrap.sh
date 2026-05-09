#!/bin/bash

# BOXSTAR BOOTSTRAP - Sovereign Installer v0.1
# "The Code Revolution starts here."

clear

# ASCII BRANDING - THE REVOLUTION MOMENT
echo -e "\033[1;36m"
echo "  ____   _______  __ ____ _____  _    ____  "
echo " | __ ) / _ \ \ \/ // ___|_   _|/ \  |  _ \ "
echo " |  _ \| | | \  /   \___ \ | | / _ \ | |_) |"
echo " | |_) | |_| /  \    ___) || |/ ___ \|  _ < "
echo " |____/ \___/_/\_\  |____/ |_/_/   \_\_| \_\\"
echo -e "\033[0m"
echo -e "\033[1;37m        CODE REVOLUTION | DIAMOND-STABLE | SECURE\033[0m"
echo "----------------------------------------------------"
echo -e "\033[0;32m[SYSTEM] Initializing Bridge...\033[0m"
sleep 1
echo -e "\033[0;32m[SYSTEM] Decrypting Personas...\033[0m"
sleep 1
echo -e "\033[0;32m[SYSTEM] Establishing AAS Integrity Gates...\033[0m"
sleep 1

# THE "ACTUAL" WORK
mkdir -p .boxstar/bin .boxstar/lib .boxstar/skills
cp bin/ag-skills.cjs .boxstar/bin/
cp lib/skill-utils.cjs .boxstar/lib/
cp catalog.json .boxstar/
cp -r skills/* .boxstar/skills/

# SETTING UP THE CLI ALIAS
echo "export PATH=\$PATH:\$(pwd)/.boxstar/bin" >> ~/.zshrc
alias boxstar="node \$(pwd)/.boxstar/bin/ag-skills.cjs"

echo "----------------------------------------------------"
echo -e "\033[1;36m✅ BOXSTAR BOOTSTRAP DEPLOYED SUCCESSFULLY.\033[0m"
echo -e "Your repository is now governed by the BoxStar Engine."
echo ""
echo -e "Try your first command:"
echo -e "\033[1;33m  boxstar list\033[0m"
echo "----------------------------------------------------"
