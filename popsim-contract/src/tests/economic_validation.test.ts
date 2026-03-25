import { PopSimFullContractSchema } from '../schemas';
import { v4 as uuidv4 } from 'uuid';

const sampleContract = {
  contractMetadata: {
    contractId: uuidv4(),
    version: '1.0',
    openModelContractRef: 'https://github.com/Metatronsdoob369/open-model-contracts',
    domicile: 'State of Delaware, USA',
    signedBy: 'Metatronsdoob369',
    effectiveDate: new Date().toISOString(),
    gate: 'SAFE',
  },
  config: {
    version: '1.0',
    swarmName: 'Roblox Dev Economy Sim',
    description: 'Simulating the impact of 70/30 splits and DevEx rates on developer archetypes.',
    llmConfig: {
      provider: 'anthropic',
      model: 'claude-3-opus',
      temperature: 0.7,
    },
    agents: [
      {
        id: uuidv4(),
        label: 'Accelerationist Dev',
        demographicAnchor: {
          percentageOfPop: 15,
          ageRange: [18, 35],
          incomeBracket: 'mid',
          geography: 'Global',
          educationLevel: 'Self-taught / CS',
        },
        stanceProbabilityDistribution: {
          'Bullish': 0.8,
          'Neutral': 0.1,
          'Bearish': 0.1,
        },
        coreValues: ['Speed', 'Scale'],
        primaryMotivations: ['Growth', 'Efficiency'],
        primaryFears: ['Stagnation', 'Over-regulation'],
        informationDiet: ['Twitter', 'Dev Forums'],
        behavioralHeuristics: ['Ship early', 'Scale fast'],
        influenceWeight: 8,
        archetypeVariations: ['Acceleration_Purist'],
        economicBehavior: {
          monetizationStrategy: 'item-based',
          riskTolerance: 0.9,
          priceSensitivity: 0.3,
          payoutThreshold: 50000,
        },
      },
    ],
    interpopulationDynamics: [],
    platformEconomics: {
      platformFeePercentage: 0.70,
      developerRevenueShare: 0.30,
      payoutConversionRate: 0.0038,
      currencyName: 'Robux',
      fiatCurrency: 'USD',
      minPayoutThreshold: 30000,
    },
    crewConfig: {
      process: 'sequential',
    },
    dashboardIntegration: {
      outputDirectory: './outputs',
      autoPost: {
        platforms: ['x'],
        frequency: 'daily',
        humanReviewRequired: true,
      },
    },
    safetyAndContingency: {
      humanReviewGate: true,
      maxRiskScoreBeforeFlag: 0.5,
      decentralizedFallback: [],
    },
  },
};

console.log('Validating Roblox-style contract...');
const result = PopSimFullContractSchema.safeParse(sampleContract);

if (result.success) {
  console.log('✅ Validation successful! Economic schemas are active.');
  console.log('Platform:', result.data.config.platformEconomics?.currencyName);
  console.log('DevEx Rate:', result.data.config.platformEconomics?.payoutConversionRate);
} else {
  console.error('❌ Validation failed:');
  console.error(JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}
