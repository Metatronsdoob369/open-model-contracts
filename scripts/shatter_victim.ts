
import fs from 'fs';
import path from 'path';

const targetFile = 'src/ServerScriptService/OMC_Ignition/Source/VictimService.luau';
const outputDir = 'lab/shatter-zone';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const code = fs.readFileSync(targetFile, 'utf8');
const lines = code.split('\n');

let currentSegment: string[] = [];
let segmentCount = 1;

function saveSegment(name: string) {
    if (currentSegment.length === 0) return;
    const fileName = `VictimService_SEGMENT_${segmentCount}_${name}.luau`;
    fs.writeFileSync(path.join(outputDir, fileName), currentSegment.join('\n'));
    console.log(`✅ Shattered segment: ${fileName}`);
    currentSegment = [];
    segmentCount++;
}

for (const line of lines) {
    currentSegment.push(line);
    
    // Logic for shattering: split at major divisions
    if (line.includes('-- ── Resonant Chase Loop')) {
        saveSegment('CORE_LOGIC');
    } else if (line.includes('function VictimService:Init()')) {
        saveSegment('LIFECYCLE');
    }
}

saveSegment('FINAL');

console.log("\n🏮 SPECTRAL SHATTERING COMPLETE");
