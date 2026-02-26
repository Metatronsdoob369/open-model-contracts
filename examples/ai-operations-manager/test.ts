/**
 * Test Case — Run the example
 *
 * Usage: tsx test.ts
 */

import { executeTask } from './executor';

async function main() {
  console.log('🚀 Open Model-Contracts — AI Operations Manager Example\n');

  const task = {
    task_type: 'strategic_reporting' as const,
    scope: {
      organizational_units: ['Engineering', 'Product'],
      ai_systems: ['recommendation_engine', 'fraud_detection'],
      time_horizon: 'quarterly' as const,
      stakeholders: ['CTO', 'VP Engineering']
    },
    context: {
      business_objectives: [
        'Reduce operational costs by 15%',
        'Improve AI model accuracy to 95%'
      ],
      compliance_frameworks: ['SOC2' as const, 'GDPR' as const],
      budget_constraints: {
        total_budget: 500000,
        allocated: 420000,
        available: 80000
      }
    },
    gate: 'ARMED' as const,
    expiry: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2 hours
    owner: 'CTO'
  };

  console.log('📋 Input Task:');
  console.log(JSON.stringify(task, null, 2));
  console.log('');

  try {
    const result = await executeTask(task);

    console.log('✅ Execution Successful!\n');
    console.log('📊 Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    console.log(`Trust Score: ${result.confidence_score}/100`);
    console.log(`Status: ${result.status}`);
  } catch (error) {
    console.error('❌ Execution Failed:', error);
    process.exit(1);
  }
}

main();
