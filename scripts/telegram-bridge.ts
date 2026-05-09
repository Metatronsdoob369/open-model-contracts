import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const TOKEN = "8617712008:AAE-VYqYbT4m4lTDtf7mAGpDgr5qpQGV1Bw";
const LOG_FILE = path.join(process.cwd(), 'telegram_inbox.jsonl');

async function monitorMesh() {
    let lastUpdateId = 0;
    console.log("📡 [GOVERNANCE] Telegram Bridge Active. Monitoring -5183945767...");

    while (true) {
        try {
            const resp = await axios.get(`https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
            const updates = resp.data.result;

            for (const update of updates) {
                lastUpdateId = update.update_id;
                const msg = update.message;
                if (msg) {
                    const entry = JSON.stringify({
                        time: new Date().toISOString(),
                        from: msg.from.username || msg.from.first_name,
                        text: msg.text,
                        chatId: msg.chat.id
                    });
                    fs.appendFileSync(LOG_FILE, entry + "\n");
                    console.log(`📩 [INCOMING] ${msg.from.first_name}: ${msg.text}`);
                }
            }
        } catch (e) {
            console.error("⚠️ Bridge Turbulence:", e.message);
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

monitorMesh();
