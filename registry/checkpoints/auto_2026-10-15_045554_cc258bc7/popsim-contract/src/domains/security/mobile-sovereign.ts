/**
 * Mobile/Sovereign Signature Library
 * Domain: Telephony, SIM/eSIM, and Mobile Protocol Security
 * 
 * Purpose: Captures signatures for mobile-specific protocol fractures 
 * and modem-level adversarial intent.
 */

export interface MobileSignature {
  id: string;
  pattern: string | RegExp;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  category: 'PROTOCOL' | 'SIM' | 'MODEM' | 'ESIM';
  heat: number;
}

export const MOBILE_SOVEREIGN_SIGNATURES: Record<string, MobileSignature> = {
  SIG_BINX_OVERFLOW: {
    id: 'SIG_BINX_OVERFLOW',
    pattern: /42494E58.{0,8}(FF|FE|FD)/i, // BINX + suspiciously large length field
    impact: 'HIGH',
    category: 'PROTOCOL',
    heat: 0.75
  },
  SIG_APDU_MODEM_HIJACK: {
    id: 'SIG_APDU_MODEM_HIJACK',
    pattern: /00(A4|88|C0|B0|D6)/i, // ISO/IEC 7816 APDU commands (Select, Authenticate, Read, Write)
    impact: 'CRITICAL',
    category: 'SIM',
    heat: 0.90
  },
  SIG_AT_CMD_OVERRIDE: {
    id: 'SIG_AT_CMD_OVERRIDE',
    pattern: /AT\+(CRSM|CSIM|CGSN|CLCC)/i, // Critical AT commands for SIM access and tracking
    impact: 'HIGH',
    category: 'MODEM',
    heat: 0.80
  },
  SIG_ESIM_PROVISION_OOB: {
    id: 'SIG_ESIM_PROVISION_OOB',
    pattern: /rsp-address|matching-id|confirmation-code/i,
    impact: 'CRITICAL',
    category: 'ESIM',
    heat: 0.85
  },
  SIG_PROACTIVE_EXFIL: {
    id: 'SIG_PROACTIVE_EXFIL',
    pattern: /(PROVIDE LOCAL INFORMATION|SEND SHORT MESSAGE|0x26|0x13)[\s\S]*(location|phonebook|SMS SUBMIT)/i,
    impact: 'CRITICAL',
    category: 'SIM',
    heat: 0.95
  },
  SIG_SIM_SIMURAI: {
    id: 'SIG_SIM_SIMURAI',
    pattern: /A0120000.*81.*0301.*OPEN_CHANNEL.*SEND_DATA.*CLOSE_CHANNEL|SIM\s?PROACTIVE.*COMMAND.*OPEN_CHANNEL|SIMURAI.*exfiltration/i,
    impact: 'CRITICAL',
    category: 'SIM',
    heat: 0.98
  },
  SIG_OTA_BINARY_SMS: {
    id: 'SIG_OTA_BINARY_SMS',
    pattern: /ENVELOPE.*(SMS-DELIVER|binary SMS|binary-sms)/i,
    impact: 'HIGH',
    category: 'SIM',
    heat: 0.85
  },
  SIG_RUN_AT_BYPASS: {
    id: 'SIG_RUN_AT_BYPASS',
    pattern: /RUN AT|0x34|AT\+CGSN|AT\+CLCC/i, // Proactive RUN AT command patterns
    impact: 'CRITICAL',
    category: 'MODEM',
    heat: 0.90
  },
  SIG_INTERPOSER_RE: {
    id: 'SIG_INTERPOSER_RE',
    pattern: /RISC-V|bootloader|delete memory|flash firmware|interposer/i,
    impact: 'HIGH',
    category: 'SIM',
    heat: 0.80
  },
  SIG_SIMURAI_FUZZ_CRASH: {
    id: 'SIG_SIMURAI_FUZZ_CRASH',
    pattern: /NULL-pointer dereference|heap buffer overflow|SEND SMS proactive|SEND SS proactive/i, // CVE-2023-50806, CVE-2024-27209
    impact: 'CRITICAL',
    category: 'MODEM',
    heat: 0.98
  },
  SIG_BASEBAND_SHANNON_LEAK: {
    id: 'SIG_BASEBAND_SHANNON_LEAK',
    pattern: /Shannon-based|S5E9925|S5E3830|Exynos-based/i, // Targeted baseband chipset signatures
    impact: 'HIGH',
    category: 'MODEM',
    heat: 0.85
  },
  SIG_WEAK_SUM_COLLISION: {
    id: 'SIG_WEAK_SUM_COLLISION',
    pattern: /sum\s*\+=|reduce\([\s\S]*acc\s*\+\s*curr/i, // Implementation of additive checksums (as seen in Jack Hacks)
    impact: 'MEDIUM',
    category: 'PROTOCOL',
    heat: 0.50
  }
};
