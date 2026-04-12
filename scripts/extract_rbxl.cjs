const fs = require('fs');

function extractScripts(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // We are looking for Item class="Script" or LocalScript or ModuleScript
    // But honestly, we just want to find <ProtectedString name="Source">
    
    const scriptRegex = /<Item class="(Script|LocalScript|ModuleScript)".*?>[\s\S]*?<string name="Name">(.*?)<\/string>[\s\S]*?<ProtectedString name="Source"><!\[CDATA\[([\s\S]*?)\]\]><\/ProtectedString>/g;
    
    let match;
    let scripts = [];
    while ((match = scriptRegex.exec(content)) !== null) {
        scripts.push({
            type: match[1],
            name: match[2],
            code: match[3]
        });
    }
    
    if (scripts.length === 0) {
        // Sometimes it's encoded differently or the regex fails due to tag ordering.
        // Let's do a fallback simple extraction of just ALL sources.
        const fallbackRegex = /<ProtectedString name="Source">([\s\S]*?)<\/ProtectedString>/g;
        let pMatch;
        let counter = 1;
        while ((pMatch = fallbackRegex.exec(content)) !== null) {
            let code = pMatch[1];
            if (code.startsWith('<![CDATA[')) {
                code = code.substring(9, code.length - 3);
            }
            if (code.trim() !== '') {
                scripts.push({
                    type: 'Unknown',
                    name: `Script_${counter}`,
                    code: code
                });
                counter++;
            }
        }
    }
    
    console.log(`Found ${scripts.length} scripts in the file.\n`);
    scripts.forEach(s => {
        console.log(`--- [${s.type}] ${s.name} ---`);
        console.log(s.code.substring(0, 200) + (s.code.length > 200 ? '\n... (truncated)' : ''));
        console.log('\n');
    });
}

extractScripts('/Users/joewales/NODE_OUT_Master/open-model-contracts/src/gothtag.rbxl');
