
import fetch from 'node-fetch';

async function fireBreach() {
    const payload = {
        schema_version: "1.0",
        pipeline_id: "12345678-1234-4123-a123-1234567890ab",
        manifest_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        ttl_seconds: 60,
        modules: [
            {
                module_id: "corrupted_logic",
                name: "CorruptedPlugin.luau",
                content: "/* GARBAGE DROP */ var x = '!!!@@@###'; function !!!() { return 123; } // JUNK JUNK JUNK !!! @@@ ### $$$ %%% ^^^ &&& *** ((( ))) _+ SLOP SLOP SLOP random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text random text",
                sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                capability_tags: ["capability:breach"]
            }
        ],
        manifest: {
            pipeline_id: "12345678-1234-4123-a123-1234567890ab",
            created_at: "2026-04-19T14:47:41Z",
            pack_id: "malware-sample",
            pack_version: "0.1.0",
            files: [
                {
                    module_id: "corrupted_logic",
                    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                }
            ]
        },
        pack_id: "malware-sample",
        pack_version: "0.1.0",
        capability_tags: ["capability:untrusted"]
    };

    console.log("🚀 LAUNCHING VALID BREACH PAYLOAD...");
    const response = await fetch('http://127.0.0.1:8080/escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log(`📡 STATUS: ${response.status} ${response.statusText}`);
    console.log("📦 RESPONSE:", JSON.stringify(result, null, 2));
}

fireBreach();
