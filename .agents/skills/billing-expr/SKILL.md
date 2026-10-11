---
name: billing-expr
description: >-
  Explains new-api expression pricing (tiered_expr): token variables, fixed
  prices, quota conversion, pre-consume/settle, and how to convert legacy
  per-token/per-request prices. Use when editing billing expressions, model
  prices, ModelRatio/ModelPrice migration, convert-all, or answering how the
  new price format is written and charged.
---

# Billing expressions

Read this skill before writing, converting, or explaining model prices. Full engine contract: `pkg/billingexpr/expr.md`. Safety rules: `.agents/rules/billing.md`.

Legacy **per-token** (`ModelRatio` + multipliers) and **per-request** (`ModelPrice`) still run, but the admin UI marks them deprecated. New prices are a single `tiered_expr` string.

## Convert legacy prices (one click)

Do **not** hand-write expressions from old ratios unless conversion is unsupported.

1. **All convertible models:** System Settings → Models → Pricing. Click **Convert all legacy prices**, confirm. Calls `POST /api/option/model_pricing/convert-all` with `{apply:true}`. Writes only models the converter accepts. Keeps old ratio/price fields so the mode can switch back.
2. **One model:** Open the model, stay on Per-token / Per-request, **Convert to expression**, review, then save. Preview is `POST /api/option/model_pricing/convert` (`{model_name, pricing}`) and does not write the DB.
3. **Keep skipped models** on the old format and convert them by hand: task plugins (`u("…")` schema), video, Realtime, some OpenRouter Claude cache-from-cost paths, Gemini/OpenAI audio price conflicts.

Converted charges use expression reservation and rounding. Unit prices are preserved; a single rounded charge may differ.

Conversion math and omit-rules: [legacy-conversion.md](legacy-conversion.md).

## Expression contract

- One string is the whole price. No extra ratio tables at evaluation time.
- Coefficients on `p`/`c`/`cr`/… are **USD per 1M tokens**. `fixed(0.01)` is **USD per request**.
- Optional prefix `v1:` (default when omitted).
- Request multipliers append after `|||` and compile to `(tier(...)) * (cond ? n : 1)`.

### Token variables

`p` / `c` are remainder buckets: a subcategory used in the expression is subtracted from `p` or `c`; unused subcategories stay in `p`/`c`. **`len` is never reduced** — use it in tier conditions, not `p`.

| Var | Meaning |
|-----|---------|
| `p` | Billable input remainder |
| `len` | Full input length (tier conditions) |
| `cr` | Cache read |
| `cc` | Cache create (5m / generic) |
| `cc1h` | Claude 1h cache create |
| `img` | Image input |
| `img_cr` | Image cache read (only if referenced and details exist) |
| `ai` / `ao` | Audio in / out |
| `c` | Billable output remainder |
| `img_o` | Image output tokens |
| `image_count` | Image **count** (1–128), not tokens |
| `u("key")` | Task usage fact from plugin `usageSchema` |

OpenAI-style `prompt_tokens` already include cache/image/audio; Claude `input_tokens` are text-only. Normalization uses AST `UsedVars`.

### Required shape

Every leaf must be `tier("name", <cost>)`.

```
tier("base", p * 2.5 + c * 15 + cr * 0.25)

len <= 200000
  ? tier("standard", p * 3 + c * 15 + cr * 0.3 + cc * 3.75 + cc1h * 6)
  : tier("long_context", p * 6 + c * 22.5 + cr * 0.6 + cc * 7.5 + cc1h * 12)

tier("request", fixed(0.01))
tier("image", fixed(0.04)) * image_count
```

`fixed()` cannot mix with token terms in the same leaf, cannot multiply by tokens, and is rejected on Realtime/task usage expressions. `image_count` may multiply a fixed leaf.

Functions: `tier`, `fixed`, `param`, `header`, `has`, `hour`/`minute`/`weekday`/`month`/`day`, `max`/`min`/`abs`/`ceil`/`floor`.

### Quota

```
token quota = exprOutput / 1_000_000 * QuotaPerUnit * groupRatio
request quota = same formula; fixed() already scales by 1_000_000 internally
task quota   = exprOutput_in_USD * QuotaPerUnit * groupRatio
```

Task example: `u("seconds") * 0.4` is $0.40/s, not $/1M. Token-unit task fields use `u("tokens") * <$/1M> / 1000000`.

Pre-consume runs the expression with estimated input (`P`/`Len`) and `C=0`. Settlement re-runs with actual usage from the frozen snapshot. Token-priced leaves apply `quota_setting.pre_consume_multiplier`; request-priced leaves do not.

## Persist

- Mode map: `billing_setting.billing_mode` → `"tiered_expr"`
- Expr map: `billing_setting.billing_expr`
- Save: `PATCH /api/option/model_pricing` with `expected_version`
- Built-in catalog expressions: `setting/billing_setting/builtin_billing.go` (real USD/1M, not new legacy ratios)

Do not invent a second price table. Do not cast unbounded floats to `int` for quota; use `common/quota_math.go`.
