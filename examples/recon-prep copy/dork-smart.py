#!/usr/bin/env python3
"""
SMART DORK GENERATOR - Works with OR without target domain
Optimizes Google searches for maximum results
"""

def smart_dork(query, target=None):
    """Generate optimized Google dorks"""
    
    dorks = []
    
    # Extract file type mentions
    file_keywords = {
        'pdf': 'filetype:pdf',
        'doc': 'filetype:doc OR filetype:docx',
        'excel': 'filetype:xls OR filetype:xlsx',
        'ppt': 'filetype:ppt OR filetype:pptx',
        'spreadsheet': 'filetype:xls OR filetype:xlsx',
        'presentation': 'filetype:ppt OR filetype:pptx',
        'cheat sheet': 'filetype:pdf OR filetype:doc',
        'guide': 'filetype:pdf',
        'template': 'filetype:doc OR filetype:xls OR filetype:pdf',
        'checklist': 'filetype:pdf OR filetype:doc'
    }
    
    # Detect what kind of content they want
    query_lower = query.lower()
    
    # Build base query
    base_query = f'"{query}"' if len(query.split()) > 2 else query
    
    # Add file type if detected
    filetype_added = False
    for keyword, filetype in file_keywords.items():
        if keyword in query_lower:
            dorks.append(f'{base_query} {filetype}')
            filetype_added = True
            break
    
    # Detect intent-based operators
    if 'tips' in query_lower or 'how to' in query_lower or 'guide' in query_lower:
        # Looking for guides/tutorials
        if not filetype_added:
            dorks.extend([
                f'{base_query} filetype:pdf',
                f'{base_query} intitle:"guide" OR intitle:"tips"',
                f'{base_query} inurl:tutorial OR inurl:guide'
            ])
        else:
            dorks.extend([
                f'{base_query} intitle:"guide" OR intitle:"tips"',
                f'intitle:"{query}" guide OR tips'
            ])
    
    elif 'cheat sheet' in query_lower or 'checklist' in query_lower:
        # Looking for quick reference materials
        dorks.extend([
            f'"{query}" filetype:pdf',
            f'intitle:"{query}"',
            f'"{query}" -site:pinterest.com -site:youtube.com'  # Exclude noise
        ])
    
    elif 'template' in query_lower or 'example' in query_lower:
        # Looking for templates/examples
        dorks.extend([
            f'{base_query} filetype:doc OR filetype:docx OR filetype:xls',
            f'{base_query} intitle:template OR intitle:example',
            f'{base_query} inurl:download OR inurl:template'
        ])
    
    elif 'contract' in query_lower or 'bid' in query_lower or 'rfp' in query_lower:
        # Government/business documents
        dorks.extend([
            f'{base_query} filetype:pdf',
            f'{base_query} site:gov OR site:mil',
            f'{base_query} intitle:"request for proposal" OR intitle:RFP',
            f'"{query}" (guide OR handbook OR manual) filetype:pdf'
        ])
    
    elif 'error' in query_lower or 'fix' in query_lower or 'troubleshoot' in query_lower:
        # Technical troubleshooting
        dorks.extend([
            f'{base_query} site:stackoverflow.com OR site:github.com',
            f'{base_query} intext:"solution" OR intext:"solved"',
            f'"{query}" forum OR discussion'
        ])
    
    else:
        # Generic enhanced search
        if not dorks:  # Only if no dorks generated yet
            dorks.extend([
                f'"{query}" filetype:pdf',
                f'{base_query} -site:pinterest.com',
                f'intitle:"{query}"'
            ])
    
    # Add target if provided
    if target:
        dorks = [f'site:{target} {dork}' for dork in dorks]
    
    # Remove duplicates while preserving order
    seen = set()
    unique_dorks = []
    for dork in dorks:
        if dork not in seen:
            seen.add(dork)
            unique_dorks.append(dork)
    
    return unique_dorks[:8]  # Top 8 most relevant

def main():
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: dork-smart.py 'your search query' [-t target.com]")
        sys.exit(1)
    
    query = sys.argv[1]
    target = None
    
    if len(sys.argv) > 3 and sys.argv[2] == '-t':
        target = sys.argv[3]
    
    dorks = smart_dork(query, target)
    
    print(f"\n🎯 Smart Dorks for: {query}")
    if target:
        print(f"🌐 Target: {target}")
    print(f"\n📋 Generated {len(dorks)} optimized searches:\n")
    
    for i, dork in enumerate(dorks, 1):
        print(f"{i}. {dork}")
    
    print(f"\n💡 Tip: Click 🔍 in the web UI to search directly!")

if __name__ == '__main__':
    main()
