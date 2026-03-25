#!/usr/bin/env python3
"""
RECON PREP TOOL - Smart Google Dork Generator
Analyzes intent and applies optimal search operator combinations
"""

import sys
import json
from typing import List, Dict, Tuple
from dataclasses import dataclass
from enum import Enum

class Intent(Enum):
    """Search intent classification"""
    FIND_FILES = "find_files"
    FIND_PAGES = "find_pages"
    FIND_VULNS = "find_vulns"
    FIND_LOGINS = "find_logins"
    FIND_ERRORS = "find_errors"
    FIND_CONFIGS = "find_configs"
    FIND_EMAILS = "find_emails"
    FIND_SUBDOMAINS = "find_subdomains"
    FIND_TECH = "find_tech"
    FIND_SPECIFIC = "find_specific"

@dataclass
class DorkTemplate:
    """Template for building Google dorks"""
    name: str
    intent: Intent
    operators: List[str]
    description: str
    example: str

class DorkEngine:
    """Smart Google dork generator"""
    
    # File extension mappings
    FILE_EXTENSIONS = {
        'pdf': ['pdf'],
        'doc': ['doc', 'docx'],
        'excel': ['xls', 'xlsx'],
        'text': ['txt', 'log'],
        'config': ['xml', 'conf', 'config', 'ini', 'yaml', 'yml'],
        'backup': ['bak', 'backup', 'old', 'save'],
        'sql': ['sql', 'db', 'database'],
        'code': ['php', 'asp', 'aspx', 'jsp', 'py', 'rb', 'pl']
    }
    
    # Vulnerability patterns
    VULN_PATTERNS = {
        'sqli': ['inurl:id=', 'inurl:product_id=', 'inurl:page_id='],
        'lfi': ['inurl:file=', 'inurl:page=', 'inurl:include='],
        'rfi': ['inurl:http', 'inurl:url='],
        'open_redirect': ['inurl:redirect=', 'inurl:return=', 'inurl:next=']
    }
    
    # Login page indicators
    LOGIN_INDICATORS = [
        'intitle:login',
        'intitle:"admin login"',
        'inurl:admin',
        'inurl:login',
        'inurl:signin',
        'intitle:"Dashboard"'
    ]
    
    # Error message patterns
    ERROR_PATTERNS = [
        'intext:"SQL syntax"',
        'intext:"mysql_fetch"',
        'intext:"Warning: mysql"',
        'intext:"PostgreSQL query failed"',
        'intext:"Error Occurred"',
        'intext:"Server Error"'
    ]
    
    def __init__(self):
        self.templates = self._build_templates()
    
    def _build_templates(self) -> List[DorkTemplate]:
        """Build dork templates"""
        return [
            DorkTemplate(
                name="PDF Files",
                intent=Intent.FIND_FILES,
                operators=['site:', 'filetype:pdf', 'intitle:', 'intext:'],
                description="Find PDF documents on target site",
                example='site:example.com filetype:pdf intitle:"confidential"'
            ),
            DorkTemplate(
                name="Exposed Configs",
                intent=Intent.FIND_CONFIGS,
                operators=['site:', 'ext:', 'intext:'],
                description="Find configuration files",
                example='site:example.com ext:xml intext:"password"'
            ),
            DorkTemplate(
                name="SQL Injection Vectors",
                intent=Intent.FIND_VULNS,
                operators=['site:', 'inurl:', 'intext:'],
                description="Find potential SQL injection points",
                example='site:example.com inurl:product_id= intext:"mysql"'
            ),
            DorkTemplate(
                name="Login Pages",
                intent=Intent.FIND_LOGINS,
                operators=['site:', 'intitle:', 'inurl:'],
                description="Find admin/login pages",
                example='site:example.com intitle:"admin login" inurl:admin'
            ),
            DorkTemplate(
                name="Error Messages",
                intent=Intent.FIND_ERRORS,
                operators=['site:', 'intext:'],
                description="Find exposed error messages",
                example='site:example.com intext:"SQL syntax"'
            ),
            DorkTemplate(
                name="Subdomains",
                intent=Intent.FIND_SUBDOMAINS,
                operators=['site:'],
                description="Enumerate subdomains",
                example='site:*.example.com'
            ),
            DorkTemplate(
                name="Email Addresses",
                intent=Intent.FIND_EMAILS,
                operators=['site:', 'intext:'],
                description="Find email addresses",
                example='site:example.com intext:"@example.com"'
            ),
            DorkTemplate(
                name="Technology Stack",
                intent=Intent.FIND_TECH,
                operators=['site:', 'intext:', 'intitle:'],
                description="Identify technology used",
                example='site:example.com intext:"powered by" OR intext:"built with"'
            )
        ]
    
    def classify_intent(self, query: str) -> Intent:
        """Classify search intent from query"""
        query_lower = query.lower()
        
        # File extensions
        for file_type, extensions in self.FILE_EXTENSIONS.items():
            if any(ext in query_lower for ext in extensions):
                return Intent.FIND_FILES
        
        # Vulnerability keywords
        if any(keyword in query_lower for keyword in ['sqli', 'injection', 'vuln', 'exploit']):
            return Intent.FIND_VULNS
        
        # Login keywords
        if any(keyword in query_lower for keyword in ['login', 'admin', 'dashboard', 'panel']):
            return Intent.FIND_LOGINS
        
        # Error keywords
        if any(keyword in query_lower for keyword in ['error', 'debug', 'warning', 'exception']):
            return Intent.FIND_ERRORS
        
        # Config keywords
        if any(keyword in query_lower for keyword in ['config', 'settings', 'env', 'credentials']):
            return Intent.FIND_CONFIGS
        
        # Email keywords
        if '@' in query_lower or 'email' in query_lower or 'contact' in query_lower:
            return Intent.FIND_EMAILS
        
        # Subdomain keywords
        if 'subdomain' in query_lower or 'domain' in query_lower:
            return Intent.FIND_SUBDOMAINS
        
        # Technology keywords
        if any(keyword in query_lower for keyword in ['tech', 'framework', 'cms', 'platform']):
            return Intent.FIND_TECH
        
        # Default to specific page search
        return Intent.FIND_SPECIFIC
    
    def extract_target(self, query: str) -> str:
        """Extract target domain from query"""
        # Look for domain patterns
        import re
        domain_pattern = r'(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}'
        match = re.search(domain_pattern, query)
        return match.group(0) if match else None
    
    def build_dork(self, query: str, target: str = None, intent: Intent = None) -> List[str]:
        """Build optimized Google dorks"""
        
        if intent is None:
            intent = self.classify_intent(query)
        
        if target is None:
            target = self.extract_target(query)
        
        dorks = []
        
        # Get relevant templates
        relevant_templates = [t for t in self.templates if t.intent == intent]
        
        if intent == Intent.FIND_FILES:
            # Extract file type
            for file_type, extensions in self.FILE_EXTENSIONS.items():
                if file_type in query.lower():
                    for ext in extensions:
                        base = f'site:{target}' if target else ''
                        dork = f'{base} filetype:{ext} {query}'
                        dorks.append(dork.strip())
        
        elif intent == Intent.FIND_VULNS:
            # Build vulnerability dorks
            base = f'site:{target}' if target else ''
            for vuln_type, patterns in self.VULN_PATTERNS.items():
                if vuln_type in query.lower():
                    for pattern in patterns:
                        dork = f'{base} {pattern}'
                        dorks.append(dork.strip())
        
        elif intent == Intent.FIND_LOGINS:
            base = f'site:{target}' if target else ''
            for indicator in self.LOGIN_INDICATORS:
                dork = f'{base} {indicator}'
                dorks.append(dork.strip())
        
        elif intent == Intent.FIND_ERRORS:
            base = f'site:{target}' if target else ''
            for pattern in self.ERROR_PATTERNS[:3]:  # Top 3
                dork = f'{base} {pattern}'
                dorks.append(dork.strip())
        
        elif intent == Intent.FIND_CONFIGS:
            base = f'site:{target}' if target else ''
            for ext in self.FILE_EXTENSIONS['config']:
                dork = f'{base} ext:{ext} intext:password OR intext:key OR intext:token'
                dorks.append(dork.strip())
        
        elif intent == Intent.FIND_EMAILS:
            base = f'site:{target}' if target else ''
            dork = f'{base} intext:"@{target}"' if target else query
            dorks.append(dork.strip())
        
        elif intent == Intent.FIND_SUBDOMAINS:
            if target:
                dorks.append(f'site:*.{target}')
                dorks.append(f'site:{target} -www')
        
        elif intent == Intent.FIND_TECH:
            base = f'site:{target}' if target else ''
            dorks.append(f'{base} intext:"powered by" OR intext:"built with"')
            dorks.append(f'{base} intext:"WordPress" OR intext:"Drupal" OR intext:"Joomla"')
        
        else:
            # Generic specific search
            base = f'site:{target}' if target else ''
            dorks.append(f'{base} {query}')
        
        return dorks[:10]  # Limit to top 10
    
    def generate_advanced_dorks(self, target: str) -> Dict[str, List[str]]:
        """Generate comprehensive dork suite for target"""
        
        categories = {
            'Files': [],
            'Logins': [],
            'Configs': [],
            'Vulnerabilities': [],
            'Errors': [],
            'Subdomains': [],
            'Emails': [],
            'Technology': []
        }
        
        # Files
        for file_type, extensions in list(self.FILE_EXTENSIONS.items())[:4]:
            for ext in extensions[:2]:
                categories['Files'].append(f'site:{target} filetype:{ext}')
        
        # Logins
        categories['Logins'] = [
            f'site:{target} {indicator}' for indicator in self.LOGIN_INDICATORS[:5]
        ]
        
        # Configs
        for ext in self.FILE_EXTENSIONS['config'][:3]:
            categories['Configs'].append(
                f'site:{target} ext:{ext} intext:password OR intext:key'
            )
        
        # Vulnerabilities
        for vuln_type, patterns in list(self.VULN_PATTERNS.items())[:2]:
            categories['Vulnerabilities'].extend([
                f'site:{target} {pattern}' for pattern in patterns[:2]
            ])
        
        # Errors
        categories['Errors'] = [
            f'site:{target} {pattern}' for pattern in self.ERROR_PATTERNS[:4]
        ]
        
        # Subdomains
        categories['Subdomains'] = [
            f'site:*.{target}',
            f'site:{target} -www'
        ]
        
        # Emails
        categories['Emails'] = [
            f'site:{target} intext:"@{target}"',
            f'site:{target} "email" OR "contact"'
        ]
        
        # Technology
        categories['Technology'] = [
            f'site:{target} intext:"powered by"',
            f'site:{target} intext:"WordPress" OR intext:"Drupal"'
        ]
        
        return categories

def main():
    """CLI interface"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Smart Google Dork Generator')
    parser.add_argument('query', nargs='?', help='Search query or target')
    parser.add_argument('-t', '--target', help='Target domain')
    parser.add_argument('-a', '--advanced', action='store_true', 
                       help='Generate advanced dork suite')
    parser.add_argument('-j', '--json', action='store_true', 
                       help='Output as JSON')
    
    args = parser.parse_args()
    
    engine = DorkEngine()
    
    if args.advanced and args.target:
        # Advanced mode
        results = engine.generate_advanced_dorks(args.target)
        
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print(f"\n🎯 Advanced Dork Suite for: {args.target}\n")
            for category, dorks in results.items():
                print(f"\n{'='*60}")
                print(f"  {category.upper()}")
                print('='*60)
                for i, dork in enumerate(dorks, 1):
                    print(f"{i}. {dork}")
    
    elif args.query:
        # Simple mode
        dorks = engine.build_dork(args.query, args.target)
        
        if args.json:
            print(json.dumps({'dorks': dorks}, indent=2))
        else:
            intent = engine.classify_intent(args.query)
            target = args.target or engine.extract_target(args.query) or "N/A"
            
            print(f"\n🔍 Query: {args.query}")
            print(f"🎯 Target: {target}")
            print(f"💡 Intent: {intent.value}")
            print(f"\n📋 Generated Dorks ({len(dorks)}):\n")
            
            for i, dork in enumerate(dorks, 1):
                print(f"{i}. {dork}")
    
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
