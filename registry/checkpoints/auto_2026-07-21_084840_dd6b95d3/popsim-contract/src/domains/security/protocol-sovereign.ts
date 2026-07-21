/**
 * Protocol/Sovereign Signature Library
 * Domain: TCP/IP Spoofing, QUIC, and Low-Level Network Fractures
 * 
 * Purpose: Captures off-path injection, sequence prediction, 
 * and 0-RTT replay patterns.
 */

export interface ProtocolSignature {
  id: string;
  pattern: string | RegExp;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  category: 'NETWORK' | 'TCP' | 'QUIC';
  heat: number;
}

export const PROTOCOL_SOVEREIGN_SIGNATURES: Record<string, ProtocolSignature> = {
  SIG_TCP_SEQ_INJECTION: {
    id: 'SIG_TCP_SEQ_INJECTION',
    pattern: /TCP\.SequenceNumber|spoof.*TCP|inject.*packet/i,
    impact: 'HIGH',
    category: 'TCP',
    heat: 0.85
  },
  SIG_IP_SPOOF_BASELINE: {
    id: 'SIG_IP_SPOOF_BASELINE',
    pattern: /IP\.srcAddress.*spoof|SRC\.IP.*mismatch/i,
    impact: 'CRITICAL',
    category: 'NETWORK',
    heat: 0.90
  },
  SIG_QUIC_0RTT_REPLAY: {
    id: 'SIG_QUIC_0RTT_REPLAY',
    pattern: /ClientHello.*0-RTT|early_data.*replay|AEAD.*decryption failure/i,
    impact: 'CRITICAL',
    category: 'QUIC',
    heat: 0.95
  },
  SIG_TTL_ASYMMETRY: {
    id: 'SIG_TTL_ASYMMETRY',
    pattern: /TTL.*drift|hop-count.*variance|asymmetric.*route/i,
    impact: 'MEDIUM',
    category: 'NETWORK',
    heat: 0.60
  },
  SIG_WLAN_DEAUTH_DOS: {
    id: 'SIG_WLAN_DEAUTH_DOS',
    pattern: /deauth.*storm|frame.*subtype.*12|disassociate.*all/i,
    impact: 'HIGH',
    category: 'NETWORK',
    heat: 0.88
  },
  SIG_WLAN_WEP_FMS: {
    id: 'SIG_WLAN_WEP_FMS',
    pattern: /WEP.*weak.*IV|RC4.*key.*scheduling|IV.*collision/i,
    impact: 'CRITICAL',
    category: 'NETWORK',
    heat: 0.95
  },
  SIG_WLAN_EAPOL_FRACTURE: {
    id: 'SIG_WLAN_EAPOL_FRACTURE',
    pattern: /0x888E|EAPoL.*handshake|4-Way.*Handshake|MIC.*failure/i,
    impact: 'CRITICAL',
    category: 'NETWORK',
    heat: 0.98
  },
  SIG_WLAN_MSCHAP_ASLEAP: {
    id: 'SIG_WLAN_MSCHAP_ASLEAP',
    pattern: /MSCHAPv2.*flaws|DES.*seed.*LEAP|Asleap.*dictionary/i,
    impact: 'HIGH',
    category: 'NETWORK',
    heat: 0.85
  },
  SIG_WLAN_EAPOL_ABUSE: {
    id: 'SIG_WLAN_EAPOL_ABUSE',
    pattern: /EAPOL-Logoff|Packet.*type.*0000.*0010|EAP.*4-Way.*Key-exchange|EAPOL-Key.*frame/i,
    impact: 'HIGH',
    category: 'NETWORK',
    heat: 0.90
  },
  SIG_WLAN_WPA3_SAE: {
    id: 'SIG_WLAN_WPA3_SAE',
    pattern: /WPA3.*SAE|Simultaneous.*Authentication.*of.*Equals|SAE.*handshake|Forward.*Secrecy.*handshake/i,
    impact: 'CRITICAL',
    category: 'NETWORK',
    heat: 0.98
  },
  SIG_WLAN_WEP_ICV_FLIP: {
    id: 'SIG_WLAN_WEP_ICV_FLIP',
    pattern: /CRC.*linear|bit-flipping.*WEP|ICV.*manipulation|C.*⊕.*P.*=.*keystream/i,
    impact: 'CRITICAL',
    category: 'NETWORK',
    heat: 0.96
  }
};


