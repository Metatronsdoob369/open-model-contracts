const fs = require('fs-extra');
const path = require('path');

/**
 * Sovereign Packer v0.1
 * Obfuscates skill instructions to prevent plain-text reverse engineering.
 */

async function packSkill(skillPath, keepSource = true) {
    const instructionsPath = path.join(skillPath, 'instructions.md');
    const packedPath = path.join(skillPath, 'instructions.packed');

    if (!fs.existsSync(instructionsPath)) return;

    const rawContent = await fs.readFile(instructionsPath, 'utf8');
    
    // Simple Base64 + Buffer shift obfuscation
    // This makes the file unreadable to the naked eye while allowing the ag-skills tool to decode it.
    const packedContent = Buffer.from(rawContent).toString('base64');
    const shiftedContent = packedContent.split('').reverse().join('');

    await fs.writeFile(packedPath, shiftedContent);
    
    if (!keepSource) {
        await fs.remove(instructionsPath);
        console.log(`✅ Packed & Locked: ${path.basename(skillPath)}`);
    } else {
        console.log(`✅ Packed (Source Kept): ${path.basename(skillPath)}`);
    }
}

async function run() {
    const skillsDir = './skills';
    const skills = fs.readdirSync(skillsDir).filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory());

    for (const skill of skills) {
        await packSkill(path.join(skillsDir, skill));
    }
}

run();
