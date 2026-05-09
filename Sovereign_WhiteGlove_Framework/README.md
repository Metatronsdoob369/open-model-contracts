# Sovereign WhiteGlove Framework

Air-gapped medical retrieval framework assembled from the WhiteGlove PRD.

## Layout

- `data/vector_blocks/medical/` — MedlinePlus cleaned shards (15,580 JSON files)
- `data/indices/medical.index` — serialized SimHash index
- `core/husk_engine.ts` — retrieval engine with hot-ring + clarification loop
- `interfaces/circadian_pulse.ts` — wake/dream reindex scheduler
- `interfaces/telegram_gateway.ts` — gateway handler (CLI-ready, Telegram-adaptable)

## Commands

From `open-model-contracts/Sovereign_WhiteGlove_Framework`:

```bash
npm run reindex
npm run query -- "How do I recognize sepsis warning signs?"
npm run benchmark:ttft
npm start -- "How do I recognize a heart attack?"
```

Wrapper commands from repo root:

```bash
bin/whiteglove doctor
bin/whiteglove init
bin/whiteglove benchmark
bin/whiteglove "How do I recognize heat stroke?"
```

## Behavioral Guarantees

- Faith-less retrieval path by default (`enableInference: false`)
- Clarification request gate when best Hamming match exceeds `0.30`
- No answer generation unless at least one citation-backed source is retrieved

If production behavior is too conservative, raise `clarificationThreshold` in `core/husk_engine.ts` from `0.30` to `0.35`.
