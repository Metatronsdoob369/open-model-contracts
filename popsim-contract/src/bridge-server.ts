/**
 * @popsim/contract — Bridge Server (Enforcement Layer)
 * This server hosts the "Law" (Zod schemas) and validates incoming
 * requests from the Roblox Luau bridge.
 */

import express from 'express';
import { PopSimFullContractSchema, PopSimContractInputSchema } from './schemas';

const app = express();
app.use(express.json());

// Cloud Run provides the PORT environment variable, defaults to 8080
const PORT = process.env.PORT || 8080;

// Health Check (Standard for Cloud Run/Kubernetes)
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// SAFE GATE: Static Economic Policy
app.get('/v1/contract/economics', (req, res) => {
    // In a real app, this would be fetched from a DB or active contract instance
    const policy = {
        platformFeePercentage: 0.70,
        developerRevenueShare: 0.30,
        payoutConversionRate: 0.0038,
        currencyName: 'Robux',
        fiatCurrency: 'USD',
        minPayoutThreshold: 30000
    };
    res.json(policy);
});

// ARMED GATE: Validation Endpoint
app.post('/v1/contract/validate', (req, res) => {
    console.log('Incoming Contract Validation Request:', req.body.runId);

    // Validate request body against our 'Law' (Zod Schema)
    const validation = PopSimContractInputSchema.safeParse(req.body);

    if (!validation.success) {
        console.error('❌ Law Violated: Invalid Contract Input');
        return res.status(400).json({
            success: false,
            gate: 'REJECTED',
            error: validation.error.format()
        });
    }

    const data = validation.data;

    // Enforcement Logic (Logic that lives in the "decider" layer)
    if (data.gate === 'ARMED') {
        // Here you would check signatures, auth tokens, or human review queues
        console.log('✅ ARMED Gate Verified for:', data.owner);
        res.json({
            success: true,
            gate: 'ARMED',
            decision: 'ALLOWED',
            auditId: `audit-${Date.now()}`
        });
    } else {
        res.json({
            success: true,
            gate: 'SAFE',
            decision: 'READ_ONLY'
        });
    }
});

app.listen(PORT, () => {
    console.log(`⚖️  Contract Enforcement Server running on port ${PORT}`);
    console.log(`🔗 Law active: @popsim/contract v1.0`);
});
