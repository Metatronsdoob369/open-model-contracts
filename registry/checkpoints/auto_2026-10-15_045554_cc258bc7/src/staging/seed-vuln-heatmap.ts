#!/usr/bin/env tsx
/**
 * src/staging/seed-vuln-heatmap.ts
 *
 * Seeds the vuln-heatmap Qdrant collection with canonical vulnerability references.
 * Sources: OWASP Top 10 (2021) + NIST NVD high-profile CVEs
 *
 * CVSS weighting: higher severity = hotter landmark in the embedding space.
 * heat_weight = cvss_score / 10.0
 *
 * Run: npx tsx src/staging/seed-vuln-heatmap.ts
 */

import http from 'http';

const QDRANT_URL = 'http://localhost:6340';
const COLLECTION = 'vuln-heatmap';

const VULN_CANONICAL_REFS = [
  // OWASP Top 10 (2021)
  { id: 'owasp-a01-2021', label: 'OWASP A01:2021 Broken Access Control', cvss: 8.1,
    text: 'Broken Access Control. Access control enforces policy such that users cannot act outside intended permissions. Failures lead to unauthorized information disclosure, modification, or destruction of data. Violations: bypassing access control checks by modifying URL, internal application state, HTML page, or API requests. Viewing or editing another account by providing its identifier. Missing access controls for POST PUT DELETE. Elevation of privilege acting as user without login or as admin when logged in as user. JWT token manipulation, cookie tampering to elevate privileges. CORS misconfiguration allowing API access from unauthorized origins. Force browsing to authenticated pages as unauthenticated user.' },

  { id: 'owasp-a02-2021', label: 'OWASP A02:2021 Cryptographic Failures', cvss: 7.5,
    text: 'Cryptographic Failures. Failures related to cryptography leading to sensitive data exposure or system compromise. Data transmitted in cleartext via HTTP SMTP FTP. Old or weak cryptographic algorithms used by default or in legacy code. Default crypto keys in use, weak keys generated or reused, improper key management or rotation. Encryption not enforced, missing HTTP security headers. Server certificate and trust chain not properly validated. Initialization vectors ignored reused or not generated securely. Deprecated hash functions MD5 SHA1 used where cryptographic hash functions needed. Cryptographic error messages or side channel information exploitable.' },

  { id: 'owasp-a03-2021', label: 'OWASP A03:2021 Injection', cvss: 9.8,
    text: 'Injection. SQL NoSQL OS LDAP injection occur when untrusted data is sent to an interpreter as part of a command or query. User-supplied data not validated filtered or sanitized. Dynamic queries or non-parameterized calls without context-aware escaping used directly in interpreter. Hostile data used within object-relational mapping search parameters. Hostile data directly used or concatenated into SQL or command structure. Injection types include SQL injection command injection LDAP injection expression language injection ORM injection XML injection. Results in unauthorized data access modification deletion authentication bypass remote command execution.' },

  { id: 'owasp-a04-2021', label: 'OWASP A04:2021 Insecure Design', cvss: 7.0,
    text: 'Insecure Design. Missing or ineffective control design. Cannot be fixed by perfect implementation since security controls were never created. Lack of business risk profiling inherent in software development. Failure to determine what level of security design is required. Missing requirements and resource management for data asset protection concerning confidentiality integrity availability authenticity. No secure design culture and methodology evaluating threats. Code not robustly designed and tested to prevent known attack methods. Missing threat modeling during design phase.' },

  { id: 'owasp-a05-2021', label: 'OWASP A05:2021 Security Misconfiguration', cvss: 7.5,
    text: 'Security Misconfiguration. Missing security hardening across application stack or improperly configured cloud service permissions. Unnecessary features enabled: unnecessary ports services pages accounts privileges. Default accounts and passwords still enabled unchanged. Error handling reveals stack traces overly informative error messages. Latest security features disabled or not configured securely after upgrades. Security settings in application servers frameworks libraries databases not set to secure values. Server not sending security headers or directives. Software out of date or vulnerable. No repeatable application security configuration process.' },

  { id: 'owasp-a06-2021', label: 'OWASP A06:2021 Vulnerable and Outdated Components', cvss: 7.2,
    text: 'Vulnerable and Outdated Components. Components such as libraries frameworks software modules run with same privileges as application. Unknown versions of all components including nested dependencies. Software vulnerable unsupported or out of date including OS web application server DBMS APIs runtime environments libraries. No regular vulnerability scanning. Not subscribed to security bulletins for components in use. Failure to fix or upgrade platform frameworks dependencies in risk-based timely fashion. Components obtained from untrusted sources without integrity verification.' },

  { id: 'owasp-a07-2021', label: 'OWASP A07:2021 Identification and Authentication Failures', cvss: 8.8,
    text: 'Identification and Authentication Failures. Application permits automated attacks such as credential stuffing with lists of valid usernames and passwords. Permits brute force or other automated attacks. Uses plain text encrypted or weakly hashed passwords. Weak or ineffective credential recovery and forgot-password processes. Missing or ineffective multi-factor authentication. Session identifier exposed in URL. Session identifier reused after successful login. Session IDs not correctly invalidated during logout or inactivity period. No account lockout after repeated failed authentication attempts.' },

  { id: 'owasp-a08-2021', label: 'OWASP A08:2021 Software and Data Integrity Failures', cvss: 8.0,
    text: 'Software and Data Integrity Failures. Code and infrastructure that does not protect against integrity violations. Application relies upon plugins libraries modules from untrusted sources repositories CDNs without integrity verification. Insecure CI/CD pipeline introducing potential for unauthorized access malicious code system compromise. Auto-update functionality downloading updates without sufficient integrity verification. Insecure deserialization where objects or data encoded into structure that attacker can see and modify. No cryptographic signing of software packages. Supply chain compromise through malicious dependencies.' },

  { id: 'owasp-a09-2021', label: 'OWASP A09:2021 Security Logging and Monitoring Failures', cvss: 6.5,
    text: 'Security Logging and Monitoring Failures. Without logging and monitoring breaches cannot be detected. Auditable events such as logins failed logins high-value transactions not logged. Warnings and errors generate no inadequate or unclear log messages. Application and API logs not monitored for suspicious activity. Logs stored only locally. Appropriate alerting thresholds and response escalation processes not in place or effective. Penetration testing and DAST scans do not trigger alerts. Application cannot detect escalate or alert for active attacks in real-time or near real-time. No incident response plan.' },

  { id: 'owasp-a10-2021', label: 'OWASP A10:2021 Server-Side Request Forgery', cvss: 8.6,
    text: 'Server-Side Request Forgery SSRF. Web application fetching remote resource without validating user-supplied URL. Attacker coerces application to send crafted request to unexpected destination bypassing firewall VPN network access control. Common targets include cloud metadata services internal services behind firewalls internal network port scanning open redirect exploitation. Fetch URL features in modern web applications create SSRF attack surface. Cloud services and complex architectures increase severity. Can lead to internal service enumeration data exfiltration remote code execution lateral movement.' },

  // NIST NVD High-Profile CVEs
  { id: 'cve-2021-44228', label: 'CVE-2021-44228 Log4Shell Remote Code Execution CVSS 10.0', cvss: 10.0,
    text: 'CVE-2021-44228 Log4Shell. Apache Log4j2 JNDI features used in configuration log messages and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints. Attacker who can control log messages or log message parameters can execute arbitrary code loaded from LDAP servers when message lookup substitution is enabled. Remote code execution via JNDI injection through user-controlled log input. CVSS score 10.0 Critical. Affected systems include any Java application using Log4j2 for logging where attacker-controlled strings are logged. Attack vector network attack complexity low privileges required none user interaction none scope changed confidentiality high integrity high availability high. Wormable exploitation observed in the wild.' },

  { id: 'cve-2017-5638', label: 'CVE-2017-5638 Apache Struts Remote Code Execution CVSS 10.0', cvss: 10.0,
    text: 'CVE-2017-5638 Apache Struts Remote Code Execution. Jakarta Multipart parser in Apache Struts incorrect exception handling and error-message generation during file-upload attempts allows remote attackers to execute arbitrary commands via crafted Content-Type Content-Disposition or Content-Length HTTP header. Remote unauthenticated code execution via HTTP header injection. CVSS 10.0 Critical. Used in the Equifax breach affecting 147 million records. Attack vector network attack complexity low privileges required none user interaction none. Exploitation requires only specially crafted HTTP headers sent to any endpoint that processes multipart uploads.' },

  { id: 'cve-2014-0160', label: 'CVE-2014-0160 Heartbleed OpenSSL Memory Disclosure CVSS 7.5', cvss: 7.5,
    text: 'CVE-2014-0160 Heartbleed. TLS and DTLS implementations in OpenSSL do not properly handle Heartbeat Extension packets allowing remote attackers to obtain sensitive information from process memory via crafted packets that trigger a buffer over-read. Memory disclosure vulnerability exposing private keys session tokens passwords. CVSS 7.5 High. Attack vector network no authentication required. Allows reading up to 64 kilobytes of server memory per request. Private key disclosure enables passive decryption of historical traffic and active man-in-the-middle attacks. Session token disclosure enables account hijacking without credentials.' },

  { id: 'cve-2019-0708', label: 'CVE-2019-0708 BlueKeep RDP Remote Code Execution CVSS 9.8', cvss: 9.8,
    text: 'CVE-2019-0708 BlueKeep. Remote code execution vulnerability in Remote Desktop Services when unauthenticated attacker connects to target system using RDP and sends specially crafted requests. Wormable vulnerability capable of propagating from vulnerable computer to vulnerable computer similar to WannaCry malware. Pre-authentication no user interaction required. CVSS 9.8 Critical. Affects Windows XP Windows 7 Windows Server 2003 2008 2008 R2. Attack vector network attack complexity low privileges required none user interaction none scope changed. Full system compromise possible. National Security Agency issued public advisory recommending immediate patching.' },

  { id: 'cve-2021-26855', label: 'CVE-2021-26855 ProxyLogon Microsoft Exchange SSRF CVSS 9.8', cvss: 9.8,
    text: 'CVE-2021-26855 ProxyLogon. Microsoft Exchange Server vulnerable to server-side request forgery SSRF vulnerability. Attacker can send arbitrary HTTP requests and authenticate as the Exchange server. Part of ProxyLogon attack chain used in widespread exploitation by nation-state actors. Combined with CVE-2021-27065 allows unauthenticated remote code execution. CVSS 9.8 Critical. Attack vector network attack complexity low privileges required none user interaction none. Exploited in the wild against hundreds of thousands of Exchange servers globally. Enables web shell deployment persistent access email exfiltration lateral movement.' },

  { id: 'pattern-sqli', label: 'SQL Injection Pattern Canonical Reference', cvss: 9.1,
    text: 'SQL Injection canonical vulnerability pattern. Unsanitized user input concatenated directly into SQL query strings. Classic patterns include single quote termination followed by SQL keywords boolean logic OR always-true conditions UNION SELECT statements to extract data DROP TABLE for destruction. Blind SQL injection via boolean conditions and time-based delays using SLEEP WAITFOR BENCHMARK. Second-order injection where input is stored then used in subsequent queries. Stored procedures called with unvalidated parameters. ORM misuse bypassing parameterization. No prepared statements no input validation no allowlist filtering. Error messages expose database schema structure table names column names. Results in authentication bypass data exfiltration data destruction privilege escalation.' },

  { id: 'pattern-auth-bypass', label: 'Authentication Bypass Pattern Canonical Reference', cvss: 9.0,
    text: 'Authentication Bypass canonical vulnerability pattern. Missing authentication checks on sensitive endpoints. Authentication state stored client-side in cookies or local storage without server-side validation. JWT tokens accepted without signature verification or with algorithm set to none. Session tokens with predictable values or insufficient entropy. Direct object reference without ownership verification. Password reset tokens with insufficient randomness or no expiry. Parallel session attacks where multiple simultaneous sessions allow bypassing single-use token requirements. Race conditions in authentication flow. Insecure remember-me tokens persisted without proper invalidation. API endpoints returning sensitive data without checking authentication headers.' },
];

function ollamaEmbed(text: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model: 'mxbai-embed-large', input: text.substring(0, 8000) });
    const req = http.request(
      { hostname: 'localhost', port: 11434, path: '/v1/embeddings', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } },
      (res) => {
        let buf = '';
        res.on('data', (d: Buffer) => buf += d);
        res.on('end', () => {
          try { resolve((JSON.parse(buf) as { data: Array<{ embedding: number[] }> }).data[0].embedding); }
          catch { reject(new Error(`Ollama parse error: ${buf.substring(0, 200)}`)); }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function stableId(s: string): number {
  return Math.abs(Array.from(s).reduce((h, c) => (Math.imul(31, h) + c.charCodeAt(0)) | 0, 0));
}

async function ensureCollection(vectorSize: number): Promise<void> {
  const check = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`);
  if (check.ok) { console.log(`[seed] Collection '${COLLECTION}' exists — upserting`); return; }
  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vectors: { size: vectorSize, distance: 'Cosine' } }),
  });
  if (!res.ok) throw new Error(`Failed to create collection: ${await res.text()}`);
  console.log(`[seed] Created collection '${COLLECTION}' dim=${vectorSize}`);
}

async function main(): Promise<void> {
  console.log('=== Seeding vuln-heatmap: OWASP Top 10 + NIST CVE canonical refs ===\n');
  const points: Array<{ id: number; vector: number[]; payload: Record<string, unknown> }> = [];

  for (const ref of VULN_CANONICAL_REFS) {
    try {
      process.stdout.write(`  Embedding ${ref.id}...`);
      const vector = await ollamaEmbed(`${ref.label}\n\n${ref.text}`);
      if (points.length === 0) await ensureCollection(vector.length);
      points.push({
        id: stableId(ref.id),
        vector,
        payload: {
          canonicalId: ref.id,
          label: ref.label,
          genre: 'vuln-canonical',
          cvss: ref.cvss,
          heatWeight: ref.cvss / 10.0,
          content: ref.text.substring(0, 2000),
          seededAt: Date.now(),
        },
      });
      console.log(` dim=${vector.length} cvss=${ref.cvss}`);
    } catch (err) {
      console.log(` FAILED: ${err}`);
    }
  }

  if (points.length === 0) {
    console.error('\n[seed] No points generated. Is Ollama running on :11434?');
    process.exit(1);
  }

  const res = await fetch(`${QDRANT_URL}/collections/${COLLECTION}/points`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ points }),
  });

  if (res.ok) {
    console.log(`\n[seed] Done. ${points.length} canonical refs in '${COLLECTION}'`);
    console.log('[seed] vuln-heatmap is live. Broseidon handler can now query for nearest CVE.');
  } else {
    console.error(`[seed] Qdrant upsert failed: ${res.status} ${await res.text()}`);
  }
}

main().catch(err => { console.error('[seed] Fatal:', err); process.exit(1); });
