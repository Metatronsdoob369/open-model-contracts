import os

def extract_lua(rbxm_path):
    print(f"🕵️ Scanning: {rbxm_path}")
    with open(rbxm_path, 'rb') as f:
        data = f.read()
    
    # .rbxm files store Lua in blocks. We search for the 'Source' property marker.
    # Pattern: PROP followed by Source name and then the data.
    # Note: Modern .rbxm uses LZ4 compression for blocks. 
    # For a quick forensic pull, we can grab the strings and reassemble,
    # but a full LZ4 decoder is better.
    
    # Since we lack lz4 lib, we search for cleartext segments between binary junk.
    import re
    # Match patterns of printable Luau code longer than 20 chars
    patterns = re.findall(b'[\x20-\x7E\s]{20,}', data)
    
    output_path = '/tmp/extracted_gameservice.lua'
    with open(output_path, 'w') as out:
        for p in patterns:
            out.write(p.decode('utf-8', errors='ignore') + '\n')
            
    print(f"✅ Extraction complete: {output_path}")

extract_lua('/Users/joewales/Downloads/GameService.rbxm')
