#!/bin/bash
# Quick polish: Add repo description and topics

echo "Adding description and topics to your GitHub repo..."

# Add description (requires GitHub CLI)
if command -v gh &> /dev/null; then
    gh repo edit Metatronsdoob369/open-model-contracts \
        --description "The legal framework for AI model execution. Prompts are suggestions. Contracts are law." \
        --add-topic "ai" \
        --add-topic "governance" \
        --add-topic "contracts" \
        --add-topic "zod" \
        --add-topic "llm" \
        --add-topic "agents" \
        --add-topic "mcp" \
        --add-topic "typescript"

    echo "✅ Description and topics added!"
else
    echo "GitHub CLI not installed. Add description manually:"
    echo "1. Go to: https://github.com/Metatronsdoob369/open-model-contracts"
    echo "2. Click the gear icon next to 'About'"
    echo "3. Add description: The legal framework for AI model execution"
    echo "4. Add topics: ai, governance, contracts, zod, llm, agents, mcp"
fi
