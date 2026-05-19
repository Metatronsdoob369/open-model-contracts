/**
 * Global Scanners & Payloads Library
 * Derived from Scanners-Box (We5ter) extraction 2026-04-21
 * 
 * Domain: Global Adversarial Intent
 */

export interface GlobalSecuritySignature {
    id: string;
    category: 'WEB' | 'NETWORK' | 'IOT' | 'DATABASE';
    pattern: string | RegExp;
    heat: number;
    description: string;
}

export const GLOBAL_SECURITY_SIGNATURES: Record<string, GlobalSecuritySignature> = {
    // 1. IOT / ICS (Expanding the S7 Division)
    SIG_IOT_MODBUS_SCAN: {
        id: 'SIG_IOT_MODBUS_SCAN',
        category: 'IOT',
        pattern: /0000000601030000000a/i, // Standard Modbus query for coils/registers
        heat: 0.85,
        description: 'Modbus TCP Read Holding Registers (Industrial Recon)'
    },
    SIG_IOT_MQTT_MALFORMED: {
        id: 'SIG_IOT_MQTT_MALFORMED',
        category: 'IOT',
        pattern: /10.{2}00044d51545404[c0|80]/i, // Suspicious MQTT Connect flags
        heat: 0.78,
        description: 'Malformed MQTT Connect Packet (IoT DOS/Auth-Bypass)'
    },

    // 2. DATABASE / CACHE (The "Hidden" Fractures)
    SIG_DB_REDIS_RCE: {
        id: 'SIG_DB_REDIS_RCE',
        category: 'DATABASE',
        pattern: /CONFIG.*SET.*dir.*\/var\/spool\/cron/i,
        heat: 0.98,
        description: 'Redis RCE via Cron Injection'
    },
    SIG_DB_MONGODB_AUTH_BYPASS: {
        id: 'SIG_DB_MONGODB_AUTH_BYPASS',
        category: 'DATABASE',
        pattern: /\{\s*"\$gt":\s*""\s*\}/i, // NoSQL Injection ($gt bypass)
        heat: 0.92,
        description: 'MongoDB NoSQL Authentication Bypass Pattern'
    },

    // 3. WEB ARSENAL (Global Injection Heat)
    SIG_WEB_SQLI_SLEEP: {
        id: 'SIG_WEB_SQLI_SLEEP',
        category: 'WEB',
        pattern: /SLEEP\(\d+\)|pg_sleep\(\d+\)|DBMS_PIPE.RECEIVE_MESSAGE/i,
        heat: 0.88,
        description: 'Time-based SQL Injection (Global Recon)'
    },
    SIG_WEB_SSRF_METADATA: {
        id: 'SIG_WEB_SSRF_METADATA',
        category: 'WEB',
        pattern: /169\.254\.169\.254|metadata\.google\.internal/i,
        heat: 0.95,
        description: 'Cloud Infrastructure SSRF (AWS/GCP Metadata)'
    },
    SIG_WEB_SCANNER_SQLMAP: {
        id: 'SIG_WEB_SCANNER_SQLMAP',
        category: 'DATABASE',
        pattern: /sqlmap.*batch|sqlmap.*target|sqlmap.*payload/i,
        heat: 0.90,
        description: 'Automated SQL Injection Scanner Fingerprint (sqlmap)'
    }
};

