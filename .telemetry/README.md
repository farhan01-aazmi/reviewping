# .telemetry/

This folder holds ReviewPing's product analytics planning artifacts, generated and maintained via the product-tracking skill lifecycle (model Ã¢â€ â€™ audit Ã¢â€ â€™ design Ã¢â€ â€™ guide Ã¢â€ â€™ implement).

- `product.md` Ã¢â‚¬â€ static product model (what the product does, entities, value mapping)
- `current-state.yaml` Ã¢â‚¬â€ audit of what tracking currently exists in the codebase
- `tracking-plan.yaml` Ã¢â‚¬â€ target tracking plan (events, properties, traits)
- `delta.md` Ã¢â‚¬â€ diff between current state and target plan
- `instrument.md` Ã¢â‚¬â€ SDK-specific implementation guide (PostHog)
- `audits/` Ã¢â‚¬â€ timestamped historical audit snapshots

Regenerate any file by re-running the corresponding skill rather than hand-editing where possible, to keep the lifecycle coherent.
