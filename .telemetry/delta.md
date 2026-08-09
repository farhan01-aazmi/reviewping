# Delta: Current Ã¢â€ â€™ Target

Current state is greenfield Ã¢â‚¬â€ no analytics SDK is wired up (`react-ga4` is an unused dependency). Every event in the target plan is new.

## Add (not tracked today) Ã¢â‚¬â€ 27 events

### Lifecycle (4)
| Event | Why |
|-------|-----|
| `user.signed_up` | Core lifecycle entry point |
| `user.logged_in` | Return/active-user signal |
| `onboarding.completed` | First activation checkpoint |
| `milestone.reached` | Consolidated "first X" milestones (backed by existing `milestones_reached` table) |

### Core Value (9)
| Event | Why |
|-------|-----|
| `review_request.sent` | Primary value action Ã¢â‚¬â€ the entire product exists to do this |
| `review_request.failed` | Delivery failure visibility |
| `review.received` | Downstream outcome of requests sent (via GBP sync) |
| `review_gateway.link_generated` | QR Gateway feature entry point |
| `review_gateway.rating_selected` | QR Gateway funnel step |
| `review_gateway.completed` | QR Gateway funnel completion |
| `gbp.connected` | Core setup step required for the product to work |
| `gbp.disconnected` | Churn/risk signal |
| `ai_reply.generated` | AI reply feature usage |

### Collaboration (3)
| Event | Why |
|-------|-----|
| `team_member.invited` | Team feature adoption (Growth/Agency) |
| `team_member.joined` | Team feature completion |
| `location.added` | Multi-location adoption (Agency) |

### Configuration (5)
| Event | Why |
|-------|-----|
| `template.created` | Configuration/setup signal |
| `automation.created` | Configuration/setup signal |
| `automation.toggled` | Usage signal for automations |
| `contact.imported` | Onboarding depth signal (single vs bulk) |
| `widget.embedded` | Feature adoption signal |

### Billing (5)
| Event | Why |
|-------|-----|
| `checkout.started` | Upgrade funnel entry Ã¢â‚¬â€ critical for conversion analysis |
| `plan.upgraded` | Revenue signal |
| `plan.downgraded` | Churn-risk signal |
| `plan.cancelled` | Churn signal |
| `limit.reached` | Upgrade-intent signal (free/starter hitting caps) |

### Navigation (1)
| Event | Why |
|-------|-----|
| `feature.gated_view` | Kept deliberately sparse Ã¢â‚¬â€ only the one high-value upgrade-intent signal, not blanket page views |

## Remove
None Ã¢â‚¬â€ nothing currently tracked.

## Rename
None Ã¢â‚¬â€ nothing currently tracked.

## Keep
None Ã¢â‚¬â€ nothing currently tracked.

## Change
None Ã¢â‚¬â€ nothing currently tracked.

## Totals
ADD (27) + RENAME (0) + KEEP (0) = 27 = total target event count. Ã¢Å“â€œ

## Implementation Priority (suggested order)
1. **Identity + business group setup** Ã¢â‚¬â€ `identify()` on login/signup, `group()` on business creation. Nothing else works without this.
2. **Billing events** Ã¢â‚¬â€ `checkout.started`, `plan.upgraded`/`downgraded`/`cancelled`. Revenue visibility from day one.
3. **Core value loop** Ã¢â‚¬â€ `review_request.sent`, `review_request.failed`, `review.received`. The primary funnel.
4. **Lifecycle** Ã¢â‚¬â€ `user.signed_up`, `user.logged_in`, `onboarding.completed`, `milestone.reached`.
5. **Everything else** Ã¢â‚¬â€ QR gateway, collaboration, configuration, `feature.gated_view` Ã¢â‚¬â€ as those flows get exercised.
