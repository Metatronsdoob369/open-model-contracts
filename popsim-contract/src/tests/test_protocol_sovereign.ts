import { SpectraMappingService } from '../core/spectra-mapping.js';

async function main() {
  const service = new SpectraMappingService();
  
  const testScripts = [
    {
      id: 'QUIC_REPLAY_ATTACK',
      code: `
        // Simulated QUIC 0-RTT Replay Fracture
        const handshake = {
          type: "ClientHello",
          early_data: true,
          setup: "draft-ietf-quic-tls-25"
        };
        
        // Replaying the 0-RTT application data packet
        if (packet.isReplay()) {
           console.warn("REPLAY_DETECTED: 0-RTT AEAD decryption failure imminent.");
        }

        // Malicious Host (MH) attempting TCP injection
        const rawPacket = {
          src: "210.10.10.10", // Spoofing Host H
          dst: "98.98.98.98",
          tcp_seq: "guessed_32bit_number",
          data: "I am a fool"
        };
      `
    }
  ];

  console.log('🌐 [PROTOCOL-TEST] Running Spectral Analysis on Networking artifact...');
  
  const reports = await service.mapBatch(testScripts);
  const report = reports[0];

  console.log('\n📊 [SPECTRAL-REPORT]');
  console.log(`ID: ${report.id}`);
  console.log(`Gate: ${report.gate}`);
  console.log(`Triggers:`, report.spatial.hotspots);

  if (report.gate === 'ARMED' && report.spatial.hotspots.some((h: string) => h.includes('PROTOCOL-SOVEREIGN'))) {
    console.log('\n✅ [SUCCESS] Protocol/Sovereign signatures correctly identified.');
  } else {
    console.log('\n❌ [FAILURE] Failed to detect protocol fracture.');
  }
}

main();
