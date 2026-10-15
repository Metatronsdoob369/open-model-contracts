/**
 * S7-Sovereign Signature Library
 * Division: ICS (Industrial Control Systems)
 * 
 * Target: Siemens S7 Protocol Fractures
 * Derived from 2026-04-21 "Attacks on Siemens S7" Extraction
 */

export interface S7Signature {
    id: string;
    description: string;
    pattern: string | RegExp;
    heat: number; // 0.0 - 1.0 (Manhattan Resonance)
    impact: 'SHUTDOWN' | 'TAKEOVER' | 'RECON';
}

export const S7_POWER_SIGNATURES: Record<string, S7Signature> = {
    SIG_S7_STOP_CPU: {
        id: 'SIG_S7_STOP_CPU',
        description: 'Unauthorized PLC Stop Command (FC 0x29)',
        // Matches the S7 JOB PDU for PLC Stop
        pattern: /32010000.{4}000a000029/i,
        heat: 0.98,
        impact: 'SHUTDOWN'
    },
    SIG_S7_PI_SERVICE_START: {
        id: 'SIG_S7_PI_SERVICE_START',
        description: 'Unauthorized PLC Start via PI-Service (_IN_02)',
        // Matches the S7 JOB PDU for PI-Service with _IN_02 parameter
        pattern: /32010000.{4}001d000028.*5f494e5f3032/i,
        heat: 0.95,
        impact: 'TAKEOVER'
    },
    SIG_S7_INJECTION_WRITE: {
        id: 'SIG_S7_INJECTION_WRITE',
        description: 'S7 Packet Injection (Write Var to DB1)',
        pattern: /0501120a10020001000184000000/i,
        heat: 0.88,
        impact: 'TAKEOVER'
    },
    SIG_S7_HANDSHAKE_ANOMALY: {
        id: 'SIG_S7_HANDSHAKE_ANOMALY',
        description: 'Non-standard TPKT/TSAP Handshake (Recon/Scanner)',
        pattern: /03[^0]0/i, 
        heat: 0.65,
        impact: 'RECON'
    },
    SIG_S7_KEY_RETRIEVAL_REQUEST: {
        id: 'SIG_S7_KEY_RETRIEVAL_REQUEST',
        description: 'Attack #3: PLC Private Key Retrieval (Technion-Haifa)',
        // Opcodes for Hardware Configuration Upload Request or text fallback
        pattern: /32010000.{4}00120000.*120411440100|Technion-Haifa.*extract.*private.*key|S7.*PLC.*key.*theft/i, 
        heat: 0.99,
        impact: 'TAKEOVER'
    },

    SIG_S7_PWD_INTERCEPTION: {
        id: 'SIG_S7_PWD_INTERCEPTION',
        description: 'Attack #1: Password Interception during Initial Provisioning',
        pattern: /hardware.*configuration.*download.*passphrase/i,
        heat: 0.95,
        impact: 'TAKEOVER'
    },
    SIG_S7_PROGRAM_HIJACK: {
        id: 'SIG_S7_PROGRAM_HIJACK',
        description: 'Attack #4: Malicious Control Program Injection (Stuxnet v3)',
        pattern: /mc7.*codegenerator.*encrypted.*seed/i,
        heat: 0.97,
        impact: 'SHUTDOWN'
    },
    // DNP3 Division (Energy/Water Grid) - Triangle MicroWorks CVE-2020-6996
    SIG_DNP3_STACK_OVERFLOW: {
        id: 'SIG_DNP3_STACK_OVERFLOW',
        description: 'DNP3 Outstation Stack-based Buffer Overflow (CWE-121)',
        pattern: /dnp3.*outstation.*buffer.*overflow|0x0564.*0x00.*0x[a-f0-9]{2}06|crafted.*dnp3.*message/i,
        heat: 0.95,
        impact: 'SHUTDOWN'
    },
    SIG_DNP3_RECON: {
        id: 'SIG_DNP3_RECON',
        description: 'DNP3 Outstation Information Retrieval / Recon',
        pattern: /dnp3.*read.*internal.*indications|DNP3.*object.*group.*0/i,
        heat: 0.75,
        impact: 'RECON'
    }
};

