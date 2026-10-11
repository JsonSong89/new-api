# Legacy → expression conversion

Source: `model.PreviewModelPricingConversion` / `model.ConvertAllLegacyPricing`.

Input USD/1M:

```
base = ModelRatio * 1_000_000 / QuotaPerUnit
```

## Per-request (`ModelPrice`)

- Text: `tier("request", fixed(price))`
- Image generation: `tier("image", fixed(price)) * image_count`, then DALL·E size/quality factors as `(cond ? multiplier : 1)` from the legacy DTO, not a second table.

## Per-token (`ModelRatio`)

Start `tier("base", p * base + c * base*CompletionRatio + …)`.

Omit a same-price input category (fold into `p`):

- `img` when `ImageRatio == 1`
- `cr` when `CacheRatio == 1` **and** it is safe to merge (no independent cache-write / image / overlapping audio). Keep `cr` when counts can overlap.

Keep explicit zeros. Cache write:

- Name contains `claude`: emit `cc` and `cc1h` (`cc1h` uses `CreateCacheRatio * 6 / 3.75`)
- Other names: emit `cc` only if `CreateCacheRatio` is configured
- No generic 1.25 fallback term

Audio:

- Gemini dedicated $/1M audio → `ai` (not `AudioRatio * base`)
- Compatible audio: `ai = base * AudioRatio`, `ao = ai * AudioCompletionRatio` (missing ratio = 1, explicit 0 kept)
- If cache/image also differ, emit audio vs text branches; audio input uses `max(len - ai, 0)`

## Skipped (must convert by hand)

- Already `tiered_expr`
- Task plugin / task alias (`u("key")` + schema)
- Video endpoints
- Realtime in the model name
- OpenRouter Claude that derives cache-write usage from upstream cost
- Conflicting Gemini vs OpenAI audio unit prices

Batch apply uses `expected_version` and does not rewrite skipped models. Old `ModelRatio` / `ModelPrice` / cache fields remain stored.
