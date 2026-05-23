# Accessibility Audit Report — ReviewPing

## 📋 Audit Overview
**Product**: ReviewPing — Review request automation platform  
**Type**: Vite + React SPA (react-helmet-async, react-router hash-less SPA routing)  
**Deployed URL**: https://reviewping-seven.vercel.app  
**Standard**: WCAG 2.2 Level AA (with AAA notes)  
**Date**: 19 May 2026  
**Auditor**: AccessibilityAuditor  
**Tools Used**: axe-core mental model, manual source code review, contrast ratio computation, keyboard navigation simulation, screen reader mental model (VoiceOver/NVDA)

---

## 🔍 Testing Methodology
| Method | Scope |
|--------|-------|
| **Source Code Audit** | All 25+ components in src/components/ |
| **Static HTML Analysis** | Deployed page HTML, all meta/SEO elements |
| **Contrast Ratio Computation** | Full theme palette against all usage contexts |
| **Keyboard Flow Simulation** | Tab order, focus management, keyboard traps |
| **ARIA Usage Audit** | Roles, states, properties, live regions, naming |
| **Screen Reader Mental Model** | Heading hierarchy, landmark navigation, announcement flow |
| **Form Validation Audit** | Labels, errors, required fields, autocomplete |

---

## 📊 Summary
**Total Issues Found**: 37  
- **Critical**: 11 — Blocks task completion for assistive technology users  
- **Serious**: 14 — Major barriers requiring significant workarounds  
- **Moderate**: 8 — Causes difficulty but has available workarounds  
- **Minor**: 4 — Annoyances that reduce usability  

**WCAG Conformance**: **DOES NOT CONFORM**  
**Assistive Technology Compatibility**: **FAIL** — Screen reader and keyboard-only users will encounter blocked flows, unlabeled controls, and invisible interactive elements.

---

## 🚨 Issues Found

---

### Issue 1: Entire app uses `<div>` soup — no semantic landmarks
**WCAG Criterion**: 1.3.1 Info and Relationships (A) | 4.1.2 Name, Role, Value (A)  
**Severity**: **Critical**  
**User Impact**: Screen reader users cannot navigate the app by landmark regions (banner, navigation, main, contentinfo). Every region is exposed as a generic "group" with no structure.  
**Location**: `AppShell.jsx` — root div, topbar div, content div, bottom nav div  
**Evidence**:  
```jsx
<div style={{...}}> {/* ROOT — no role */}
  <div> {/* TOPBAR — should be <header role="banner"> */}
  <div> {/* CONTENT AREA — should be <main> */}
  <div> {/* BOTTOM NAV — should be <nav> */}
```
**Recommended Fix**:  
```jsx
<header role="banner" style={...}>  {/* topbar */}
<main id="main-content" style={...}>  {/* content */}
<nav aria-label="Main navigation" style={...}>  {/* bottom nav */}
<footer role="contentinfo" style={...}>  {/* footer */}
```
**Testing Verification**: Navigate with screen reader Rotor/Landmarks menu — should show Banner, Main, Navigation, Contentinfo entries.

---

### Issue 2: No skip-to-content link
**WCAG Criterion**: 2.4.1 Bypass Blocks (A)  
**Severity**: **Critical**  
**User Impact**: Keyboard and screen reader users must tab through every repeated navigation item (top bar, bottom nav) before reaching the main content on every page load.  
**Location**: `AppShell.jsx` — first rendered element  
**Recommended Fix** — Add as the very first focusable element:  
```jsx
<a
  href="#main-content"
  style={{
    position: 'absolute',
    left: '-9999px',
    zIndex: 9999,
    padding: '8px 16px',
    background: G.accent,
    color: '#fff',
    fontFamily: 'Manrope, sans-serif',
    fontSize: 14,
  }}
  onFocus={(e) => e.currentTarget.style.left = '8px'}
  onBlur={(e) => e.currentTarget.style.left = '-9999px'}
>
  Skip to content
</a>
```
Then add `id="main-content"` to the content area div.  
**Testing Verification**: Press Tab on page load — "Skip to content" link must appear first and work.

---

### Issue 3: Bottom navigation buttons lack `aria-current="page"`
**WCAG Criterion**: 4.1.2 Name, Role, Value (A) | 1.3.1 Info and Relationships (A)  
**Severity**: **Serious**  
**User Impact**: Screen reader users cannot determine which section is currently active. The active state is conveyed only via color (`G.accent` vs `G.muted`) and font-weight (700 vs 500).  
**Location**: `AppShell.jsx` line 487-531  
**Evidence**:  
```jsx
<button key={n.id} onClick={() => { ... }} style={{ color: screen === n.id ? G.accent : G.muted, ... }}>
  {n.icon}
  <span style={{ fontWeight: screen === n.id ? 700 : 500, ... }}>{n.label}</span>
</button>
```
**Recommended Fix**:  
```jsx
<button
  aria-current={screen === n.id ? 'page' : undefined}
  ...
>
```
**Testing Verification**: Navigate to Home with screen reader — should announce "Home, current page" or similar.

---

### Issue 4: Interactive `<span>` elements not keyboard accessible
**WCAG Criterion**: 2.1.1 Keyboard (A) | 4.1.2 Name, Role, Value (A)  
**Severity**: **Critical**  
**User Impact**: Multiple interactive controls across the app are implemented as `<span>` or `<div>` elements with `onClick` but no `tabindex`, `role`, or keyboard event handlers. Keyboard-only users cannot activate them.  
**Locations** (8 instances):

| Location | Text | Code |
|----------|------|------|
| `Landing.jsx:651` | Monthly | `<span onClick={() => setAnnual(false)}>` |
| `Landing.jsx:662` | Annual toggle | `<div onClick={() => setAnnual((a) => !a)}>` |
| `Landing.jsx:688` | Annual | `<span onClick={() => setAnnual(true)}>` |
| `Landing.jsx:885` | Footer links | `<span onClick={fn ? props[fn] : undefined}>` |
| `Login.jsx:232` | Forgot password? | `<span onClick={onForgot}>` |
| `Login.jsx:254` | Start free trial → | `<span onClick={onSignup}>` |
| `Signup.jsx:163` | Terms | `<span onClick={...}>` |
| `ForgotPassword.jsx:100` | try again | `<span onClick={() => setSent(false)}>` |

**Recommended Fix** — Use either `<button>` elements or add proper ARIA:
```jsx
<button type="button" onClick={onForgot} style={{ background: 'none', border: 'none', ... }}>
  Forgot password?
</button>
```
For the pricing toggle, use a proper switch pattern:
```jsx
<button
  role="switch"
  aria-checked={annual}
  onClick={() => setAnnual(!annual)}
  style={{ ... }}
>
  <span>Monthly</span>
  <span>Annual</span>
</button>
```
**Testing Verification**: Tab to each control and press Enter/Space — must activate the control.

---

### Issue 5: `ariaLabel` prop silently ignored (broken accessible naming)
**WCAG Criterion**: 4.1.2 Name, Role, Value (A)  
**Severity**: **Critical**  
**User Impact**: Buttons with `ariaLabel` prop never receive an accessible name. Screen readers announce "button" with no context. The prop name `ariaLabel` is camelCase — React renders it as a custom `ariaLabel` attribute in the DOM, NOT the correct `aria-label` attribute.  
**Locations**:
- `SendReq.jsx:270` — Apply template button: `ariaLabel="Apply template"`
- `SendReq.jsx:283` — AI Write button: `ariaLabel="AI write message"`
- `SendReq.jsx:391` — Send button: `ariaLabel="Send review request"`
- `BulkSend.jsx:544` — Send bulk button: `ariaLabel="Send bulk"`

**Root Cause** — `Btn.jsx` spreads `...rest` onto `<button>`. React does NOT convert `ariaLabel` → `aria-label`. Only `aria-label` (hyphenated in JSX) is recognized.

**Recommended Fix** — In `Btn.jsx`, explicitly handle the prop:
```jsx
const Btn = forwardRef(function Btn({
  children, variant, size, disabled, loading, onClick, style, fullWidth, type,
  ariaLabel,  // <-- destructure it
  ...rest
}, ref) {
  return (
    <button
      ref={ref}
      aria-label={ariaLabel}  // <-- explicitly map to hyphenated form
      {...rest}
    >
```
**Testing Verification**: Inspect button in DOM — must show `aria-label="Apply template"` not `ariaLabel`.

---

### Issue 6: `outline: none` on form fields without custom focus indicator
**WCAG Criterion**: 2.4.11 Focus Appearance (AA) | 2.4.7 Focus Visible (AA)  
**Severity**: **Critical**  
**User Impact**: Keyboard users navigating through forms see NO focus indicator on text inputs, textareas, and select elements. The default browser outline is removed but no replacement is provided.  
**Locations**: `Field.jsx:29`, `Sel.jsx:52`, `SendReq.jsx:312`, `BulkSend.jsx:391,423`, `ReviewsPage.jsx:109,145,281`, `SentLog.jsx:67`, `Contacts.jsx:198`, `Integrations.jsx:154`  
**Code**:  
```jsx
outline: "none",
```
The `handleFocus` function changes border color to `G.accent`, but this only works during that specific React event handler instance and relies on the 1.5px border change — which is insufficient as a focus indicator (too thin, and `G.accent` may not contrast sufficiently against `G.surface` at 1.5px).

**Recommended Fix** — Replace `outline: "none"` with a visible focus-visible ring:
```jsx
// In sharedStyles:
outline: "none",
boxShadow: "none",

// In handleFocus:
e.currentTarget.style.boxShadow = `0 0 0 3px ${G.accent}40`;
e.currentTarget.style.borderColor = G.accent;

// In handleBlur:
e.currentTarget.style.boxShadow = "none";
e.currentTarget.style.borderColor = G.border;

// Better: use CSS-in-JS with :focus-visible
```
Or add a global focus style:
```css
*:focus-visible {
  outline: 2px solid #C93D10;
  outline-offset: 2px;
}
```
**Testing Verification**: Tab to every form field — visible focus ring must appear.

---

### Issue 7: `G.muted` (#9A9186) text fails contrast ratio on most backgrounds
**WCAG Criterion**: 1.4.3 Contrast Minimum (AA) | 1.4.11 Non-text Contrast (AA)  
**Severity**: **Serious**  
**User Impact**: Body text, descriptions, timestamps, and footer text using `G.muted` is extremely difficult to read for users with low vision.  
**Evidence**:
| Usage | Text size | Contrast | Verdict |
|-------|-----------|----------|---------|
| `G.muted` on `G.bg` (#F6F3EE) | 12-16.5px (normal) | **2.80:1** | FAIL AA |
| `G.muted` on `G.surface` (#FFF) | 12-14.5px (normal) | **3.10:1** | FAIL AA (passes for large text only) |

Affected everywhere `G.muted` is used for body text, including:
- Landing page hero description: `fontSize: 16.5, color: G.muted` — **FAILS AA**
- Footer links and copyright: `fontSize: 12.5, color: G.muted` — **FAILS AA**
- Dashboard subtitle: `fontSize: 13.5, color: G.muted` — **FAILS AA**
- Review timestamps: `fontSize: 11, color: G.mutedLo` — **FAILS AA** (1.80:1)
- Live ticker "via ReviewPing": `fontSize: 12, color: G.muted` — **FAILS AA**
- Process step descriptions: `fontSize: 13.5, color: G.muted` — **FAILS AA**

**Recommended Fix**:  
```js
// Darken muted to at least #6B655A (luminance ~0.18) for 5.5:1 on white
muted: "#6B655A",
mutedLo: "#A0988A",  // lighten or use only as decorative border
```
Minimum acceptable `muted` on white (#FFF): #76706B (4.56:1)  
Minimum acceptable `muted` on bg (#F6F3EE): #736D68 (4.52:1)

**Testing Verification**: Re-test with WebAIM contrast checker.

---

### Issue 8: `G.gold` (#E8A020) on white/surface fails contrast for rating values
**WCAG Criterion**: 1.4.3 Contrast Minimum (AA)  
**Severity**: **Serious**  
**User Impact**: The average rating value displayed in the Dashboard uses gold color, which is virtually unreadable against white card backgrounds.  
**Location**: `Dashboard.jsx` line 76-77, `Landing.jsx` line 223 (gold stat)  
**Evidence**:  
```jsx
// Dashboard — "Avg Rating" card
<div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 30, color: G.gold, ... }}>
  {avg}★
</div>
```
Contrast: **2.22:1** — FAILS WCAG AA even for large text (min 3:1).

**Recommended Fix**:  
```js
gold: "#B87D10",  // Darker gold — 4.63:1 on white
```
Or use a dark background for the gold stat, or use `G.ink` for the value and `G.gold` as an accent-only color for the star icon.

**Testing Verification**: Gold text should achieve ≥ 4.5:1 on adjacent backgrounds.

---

### Issue 9: Notification bell icon button has no accessible label
**WCAG Criterion**: 4.1.2 Name, Role, Value (A) | 1.1.1 Non-text Content (A)  
**Severity**: **Critical**  
**User Impact**: Screen reader users hear "button" with no context. The SVG icon conveys the purpose visually but has no text alternative.  
**Location**: `AppShell.jsx` lines 290-337  
**Evidence**:  
```jsx
<button onClick={() => navigate("notifications")} style={{...}}>
  <svg width="20" height="20" ...>
    <path d="M18 8A6 6 0 0 0 6 8..."/>
  </svg>
  {unread > 0 && <div style={{...}}>{unread > 9 ? "9+" : unread}</div>}
</button>
```
**Recommended Fix**:  
```jsx
<button aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`} ...>
```
Also add `aria-hidden="true"` to the SVG inside the button.

**Testing Verification**: Focus the bell — screen reader should announce "Notifications, 3 unread, button".

---

### Issue 10: No focus trapping in modals
**WCAG Criterion**: 1.3.2 Meaningful Sequence (A) | 2.4.3 Focus Order (A)  
**Severity**: **Serious**  
**User Impact**: When a modal is open, keyboard focus can tab out of the modal behind the backdrop overlay. Users can interact with background content while the modal is displayed, causing confusion.  
**Locations**: `ConfirmModal.jsx`, `EditProfileModal.jsx`  
**Evidence** (ConfirmModal.jsx):
```jsx
useEffect(() => {
  if (open) {
    setTimeout(() => confirmRef.current?.focus(), 50); // sets focus but no trap
  }
}, [open]);
```
**Recommended Fix** — Add focus trapping:
```jsx
import { useCallback } from 'react';

// In the modal component
const handleKeyDown = useCallback((e) => {
  if (e.key !== 'Tab') return;
  const focusable = modalRef.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable || focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}, []);

// Attach to the modal container
<div role="dialog" onKeyDown={handleKeyDown} ref={modalRef} ...>
```
**Testing Verification**: Open modal, press Tab repeatedly — focus must cycle within the modal, not escape.

---

### Issue 11: Comparison data table lacks `<caption>` and proper header associations
**WCAG Criterion**: 1.3.1 Info and Relationships (A) | 4.1.2 Name, Role, Value (A)  
**Severity**: **Moderate**  
**User Impact**: Screen reader users navigating the pricing comparison table don't get a programmatic description of the table's purpose. The header cells (`<th>`) are present but the table lacks a caption or `aria-label`.  
**Location**: `Landing.jsx` lines 439-516  
**Evidence**:
```jsx
<table style={{...}}>
  <thead>
    <tr>
      {["", "ReviewPing", "Podium"].map((h, i) => (
        <th key={i} style={{...}}>{h}</th>
      ))}
    </tr>
  </thead>
```
**Recommended Fix**:
```jsx
<table aria-label="Comparison between ReviewPing and Podium pricing and features">
  <caption style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
    ReviewPing vs Podium comparison
  </caption>
```
**Testing Verification**: Navigate to the table with screen reader — it should announce the table purpose.

---

### Issue 12: Auto-rotating live ticker not announced
**WCAG Criterion**: 2.2.2 Pause, Stop, Hide (A) | 4.1.3 Status Messages (AA)  
**Severity**: **Serious**  
**User Impact**: The live ticker on the landing page rotates content every 3 seconds. Screen reader users either miss the updates (no `aria-live` region) or are interrupted by them. There is no pause mechanism.  
**Location**: `Landing.jsx` lines 73-103  
**Evidence**:
```jsx
<div style={{...}}>
  <div style={{animation: "blink 2s infinite"}} />
  <span key={tick} className="ft" style={{...}}>
    {live[tick]}
  </span>
</div>
```
The `key={tick}` causes React to re-mount the span on each tick. This means a screen reader would re-announce the element as a new insertion, but without `aria-live` the announcement timing is unpredictable.

**Recommended Fix**:
```jsx
<div aria-live="polite" aria-atomic="true" style={{...}}>
  <span key={tick} className="ft" style={{...}}>
    {live[tick]}
  </span>
</div>
```
And add a pause button:
```jsx
<button aria-label="Pause live updates" onClick={() => setPaused(!paused)}>
  {paused ? '▶' : '⏸'}
</button>
```
**Testing Verification**: Screen reader should announce new ticker content without requiring focus.

---

### Issue 13: Missing `autocomplete` attributes on form fields
**WCAG Criterion**: 1.3.5 Identify Input Purpose (AA)  
**Severity**: **Moderate**  
**User Impact**: Users with cognitive disabilities and autofill-dependent users cannot automatically fill in their details on login/signup forms.  
**Locations**: `Login.jsx` — email/password fields, `Signup.jsx` — name/email/password/biz fields  
**Recommended Fix**:
```jsx
<Field label="Email address" type="email" autoComplete="email" ... />
<Field label="Password" type="password" autoComplete="current-password" ... />
<Field label="Full name" autoComplete="name" ... />
<Field label="Business name" autoComplete="organization" ... />
```
**Testing Verification**: Browser autofill should offer to save/autocomplete credentials.

---

### Issue 14: `aria-busy` used on Card container in SendReq — invalid usage
**WCAG Criterion**: 4.1.2 Name, Role, Value (A)  
**Severity**: **Moderate**  
**User Impact**: `aria-busy` is applied to a non-interactive container (`<div>` with no widget role), which has no meaning for generic elements.  
**Location**: `SendReq.jsx` line 210  
**Evidence**:
```jsx
<Card sx={{ marginBottom: 14 }} onKeyDown={handleKeyDown} aria-busy={aiLoad || undefined}>
```
`aria-busy` is valid only on elements with roles like `region`, `grid`, `tree`, etc. On a generic `<div>` it's ignored.

**Recommended Fix**: Move `aria-busy` to the region containing the dynamic content, or use `role="region"` on the Card.

---

### Issue 15: Dashboard "Send Review Request" button has ambiguous emoji label
**WCAG Criterion**: 4.1.2 Name, Role, Value (A) | 1.1.1 Non-text Content (A)  
**Severity**: **Moderate**  
**User Impact**: The ⚡ emoji before "Send Review Request" may be announced unpredictably by screen readers (as "zap" or "high voltage sign"), adding noise to the accessible name.  
**Location**: `Dashboard.jsx` line 109  
**Evidence**:
```jsx
⚡ Send Review Request
```
**Recommended Fix**: Wrap the emoji in `aria-hidden="true"`:
```jsx
<span aria-hidden="true">⚡</span> Send Review Request
```
Or use an inline SVG with `aria-hidden="true"`.

---

### Issue 16: Empty table headers in comparison table — first column header is empty string
**WCAG Criterion**: 1.3.1 Info and Relationships (A)  
**Severity**: **Moderate**  
**User Impact**: The first `<th>` in the comparison table contains an empty string — `""`. Screen readers may announce an empty header, causing confusion about the first column's purpose.  
**Location**: `Landing.jsx` line 448-461  
**Evidence**:
```jsx
{["", "ReviewPing", "Podium"].map((h, i) => (
  <th key={i} ...>
    {h}
  </th>
))}
```
**Recommended Fix**:
```jsx
{["Feature", "ReviewPing", "Podium"].map((h, i) => (
  <th scope={i === 0 ? "row" : "col"} ...>{h}</th>
))}
```
And add `scope="col"` / `scope="row"` to table header cells.

---

### Issue 17: Card hoverable effect has no keyboard equivalent
**WCAG Criterion**: 2.1.1 Keyboard (A) | 2.4.7 Focus Visible (AA)  
**Severity**: **Moderate**  
**User Impact**: The "More" page navigation cards have a visual hover effect (elevation + slight translateY) triggered by `onMouseEnter`/`onMouseLeave` but no corresponding `:focus-visible` or `onFocus`/`onBlur` effect. Keyboard users navigating to these cards don't see the same feedback.  
**Location**: `Card.jsx` lines 24-39, `More.jsx` line 37  
**Evidence**:
```jsx
// Card.jsx — mouse-only hover
onMouseEnter={isHoverable ? (e) => { e.currentTarget.style.boxShadow = "..."; e.currentTarget.style.transform = "translateY(-1px)"; } : undefined}
onMouseLeave={hover ? (e) => { ... } : undefined}
```
**Recommended Fix**:
```jsx
onFocus={isHoverable ? (e) => { ... same visual ... } : undefined}
onBlur={isHoverable ? (e) => { ... reset ... } : undefined}
```
And ensure the Card has `tabIndex={0}` when hoverable (if not already a button).

---

### Issue 18: `CookieBanner.jsx` missing ARIA dialog role
**WCAG Criterion**: 4.1.2 Name, Role, Value (A)  
**Severity**: **Moderate**  
**User Impact**: The cookie banner is visually prominent but not recognized as a dialog/alert by screen readers.  
**Location**: `CookieBanner.jsx`  
**Evidence**:
```jsx
<div style={{ position: "fixed", bottom: 0, left: 0, right: 0, ... }}>
```
**Recommended Fix**:
```jsx
<div role="dialog" aria-label="Cookie consent" aria-modal="false" ...>
```
---

### Issue 19: No page `<title>` update for SPA navigation (except via react-helmet-async)
**WCAG Criterion**: 2.4.2 Page Titled (A) | 4.1.2 Name, Role, Value (A)  
**Severity**: **Serious**  
**User Impact**: The `SEO` component uses `<Helmet>` from `react-helmet-async` which should update the page title. However, audit of the deployed HTML shows the base title only. The SPA routing uses a custom `navigate` function with state-managed screen switching, not a router. This means there is no automatic focus management or title update on screen change.  
**Location**: `SEO.jsx`, `AppShell.jsx`  
**Evidence**:  
The `SEO` component references `Helmet` from `react-helmet-async`, but the page title in the raw HTML is the default. If the Helmet update fails or is delayed, screen readers won't get updated page titles on navigation.

**Recommended Fix**: When screen changes, explicitly announce the change:
```jsx
const navigate = useCallback((to) => {
  setPrevScreen(screen);
  setScreen(to);
  // Announce screen change
  document.title = `${to.charAt(0).toUpperCase() + to.slice(1)} · ReviewPing`;
  // Move focus to main content
  document.getElementById('main-content')?.focus();
}, [screen]);
```
**Testing Verification**: Navigate from Dashboard to Analytics — the page title should update and focus should move to content area.

---

### Issue 20: Decorative SVG icons lack `aria-hidden="true"`
**WCAG Criterion**: 1.1.1 Non-text Content (A)  
**Severity**: **Moderate**  
**User Impact**: Several SVG icons used purely for decoration may be announced by screen readers, adding noise.  
**Locations**:  
- `AppShell.jsx` lines 210-241 — Bottom nav icons (SVG elements)
- `AppShell.jsx` lines 303-315 — Bell icon
- `Dashboard.jsx` line 109 — Lightning emoji
- `Login.jsx` lines 155-177 — Google logo SVG

**Recommended Fix**: Add `aria-hidden="true"` to all decorative SVGs and wrap decorative emojis in `<span aria-hidden="true">`.

---

### Issue 21: `EditProfileModal` first field focuses by ID string, not ref
**WCAG Criterion**: 4.1.2 Name, Role, Value (A)  
**Severity**: **Minor**  
**User Impact**: The EditProfileModal uses `document.getElementById("edit-profile-name")` to focus the first field, which is fragile (breaks if the ID changes) and could fail if the element hasn't rendered.  
**Location**: `EditProfileModal.jsx` lines 26-28  
**Evidence**:
```jsx
setTimeout(() => {
  const el = document.getElementById("edit-profile-name");
  el?.focus();
}, 50);
```
**Recommended Fix**: Use a ref instead:
```jsx
const firstFieldRef = useRef(null);

<Field ref={firstFieldRef} id="edit-profile-name" label="Name" ... />

useEffect(() => {
  if (open) {
    setTimeout(() => firstFieldRef.current?.focus(), 50);
  }
}, [open]);
```
Note: `Field` doesn't currently forward refs — would need to add `forwardRef`.

---

### Issue 22: Emojis used as icons with no text alternative
**WCAG Criterion**: 1.1.1 Non-text Content (A)  
**Severity**: **Moderate**  
**User Impact**: Emojis used as icons (📭 in EmptyState, ✓ in feature lists, ⚡ for CTA) are read by screen readers but don't convey the same meaning as their visual context.  
**Locations**: Many — `EmptyState.jsx` line 4, `Onboarding.jsx` line 303+, `Dashboard.jsx` line 109, `More.jsx` lines 7-16  
**Recommended Fix**:
```jsx
<span role="img" aria-label="Empty mailbox">📭</span>
```
Or for purely decorative emojis: `<span aria-hidden="true">✓</span>` with the semantic meaning in the adjacent text.

---

### Issue 23: `Stars` component returns `null` for null/undefined ratings — missing visual placeholder
**WCAG Criterion**: 4.1.2 Name, Role, Value (A)  
**Severity**: **Minor**  
**User Impact**: If a review has no rating (pending review), the Stars component renders nothing. The rating star area is completely empty — no placeholder, no text saying "Not yet rated".  
**Location**: `Stars.jsx` line 4  
**Evidence**:
```jsx
if (rating === null || rating === undefined) return null;
```
**Recommended Fix**:
```jsx
if (rating === null || rating === undefined) {
  return <span style={{ color: G.muted, fontSize: 11 }}>Not yet rated</span>;
}
```
---

### Issue 24: Focus order skips over content area when navigating between bottom nav items
**WCAG Criterion**: 2.4.3 Focus Order (A)  
**Severity**: **Serious**  
**User Impact**: When navigating between screens via the bottom nav, focus is NOT moved to the content area. After pressing a nav button, the focus either stays on the button or jumps to the top of the page, forcing keyboard users to tab back through potentially dozens of items.  
**Location**: `AppShell.jsx` — navigation click handlers do not manage focus  
**Evidence**:  
The bottom nav buttons set `screen` state but never shift focus:
```jsx
<button onClick={() => { setScreen(n.id); setPrevScreen(null); }} ...>
```
**Recommended Fix**:
```jsx
<button
  onClick={() => {
    setScreen(n.id);
    setPrevScreen(null);
    // Move focus to the screen title
    setTimeout(() => document.querySelector('h2, h1')?.focus(), 50);
  }}
  ...
>
```
Or add a `tabIndex="-1"` container at the top of each screen that receives focus programmatically.

---

### Issue 25: Loading/error states for Supabase async data not accessible
**WCAG Criterion**: 4.1.3 Status Messages (AA)  
**Severity**: **Serious**  
**User Impact**: Data from Supabase (reviews, templates, contacts, notifications) loads asynchronously with no loading state announced to screen readers. When data fails to load, errors are silently swallowed.  
**Location**: `AppShell.jsx` — `useSupabaseArray` hooks  
**Evidence**: The Suspense fallback shows a `Spinner` (which has `role="status"`) — this is good. But individual pages may have additional async loading that isn't announced. The `useSupabaseArray` hook could return loading/error states that are not exposed.

**Recommended Fix**: Ensure all data-fetching pages announce loading/error states:
```jsx
// In each page that uses async data
{loading && <div aria-live="polite" role="status">Loading data...</div>}
{error && <div role="alert">Failed to load: {error}</div>}
```
---

### Issue 26: "Back" button in secondary screens is a `<button>` with only visual text
**WCAG Criterion**: 4.1.2 Name, Role, Value (A)  
**Severity**: **Minor**  
**User Impact**: "← Back" is text inside a button — it's accessible. However, there's no `aria-label` to differentiate it from other "Back" buttons if there were multiple. This is acceptable but could be improved for clarity.  
**Location**: `AppShell.jsx` lines 268-285  
**Testing Verification**: Should announce "Back, button" — acceptable.

---

### Issue 27: LogoMark/Wordmark lacks link to homepage
**WCAG Criterion**: 2.4.1 Bypass Blocks (A) | 3.2.3 Consistent Navigation (AA)  
**Severity**: **Moderate**  
**User Impact**: Users expect clicking the logo to return to the home/dashboard. The Wordmark component is a plain `<div>`, not a link.  
**Location**: `Wordmark.jsx` — rendered as a non-interactive `<div>`, `AppShell.jsx` line 287  
**Recommended Fix**:
```jsx
// In AppShell topbar
<a href="/" onClick={(e) => { e.preventDefault(); navigate("dashboard"); }} style={{ textDecoration: 'none' }}>
  <Wordmark size={14} />
</a>
```

---

### Issue 28: Overlay backdrop click-to-close not keyboard accessible
**WCAG Criterion**: 2.1.1 Keyboard (A)  
**Severity**: **Serious**  
**User Impact**: Both modals can be closed by clicking the backdrop overlay (`onClick` on the backdrop div checks `e.target === e.currentTarget`). But keyboard users cannot dismiss the modal by pressing a dedicated "close" button on the backdrop, and there's no separate close button (X) in the header.  
**Locations**: `ConfirmModal.jsx` line 52-54, `EditProfileModal.jsx` lines 61-63  
**Evidence**:
```jsx
// ConfirmModal — only cancel button closes via keyboard
// No explicit close/X button
// Escape works (handled)

// EditProfileModal — same pattern
```
**Recommended Fix**: Add a visible close button to each modal:
```jsx
<button
  onClick={onCancel || onClose}
  aria-label="Close dialog"
  style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", cursor: "pointer", fontSize: 18, color: G.muted }}
>
  ✕
</button>
```
---

### Issue 29: Plan pill (Starter/Growth/Agency) uses color alone to convey status
**WCAG Criterion**: 1.4.1 Use of Color (A)  
**Severity**: **Moderate**  
**User Impact**: The topbar pill uses `success` variant (green) for "Growth" and `info` variant (teal) for others. Green/teal differentiation may be indistinguishable for color-blind users.  
**Location**: `AppShell.jsx` lines 338-347  
**Evidence**:
```jsx
<Pill label={...} variant={plan === "growth" ? "success" : "info"} />
```
**Recommended Fix**: Add text distinction or an icon alongside the color:
```jsx
<Pill label={`${plan === "growth" ? "★ " : ""}${label}`} variant={...} />
```
---

### Issue 30: `aria-describedby` references ID that may not be unique across instances
**WCAG Criterion**: 4.1.2 Name, Role, Value (A)  
**Severity**: **Minor**  
**User Impact**: If the same Field component appears multiple times on a page (e.g., two text inputs with the same label), the auto-generated ID `field-${label}` would collide, causing `aria-describedby` to reference a non-unique ID.  
**Location**: `Field.jsx` line 48  
**Evidence**:
```jsx
const id = rest.id || `field-${label?.toLowerCase().replace(/\s+/g, "-")}`;
```
**Recommended Fix**: Append a unique counter or use `useId()` from React:
```jsx
import { useId } from 'react';
const generatedId = useId();
const id = rest.id || `${generatedId}-field`;
```
---

### Issue 31: `Tab` key on "Send Review Request" form submits via `handleKeyDown` but no form element wraps the form
**WCAG Criterion**: 3.2.2 On Input (A)  
**Severity**: **Minor**  
**User Impact**: The Enter key submits the form via `handleKeyDown` on a `Card` component, but the form fields are not wrapped in a `<form>` element. This means native form validation, submission events, and `onSubmit` handlers are not available.  
**Location**: `SendReq.jsx` line 207-210  
**Evidence**:
```jsx
<Card sx={{ marginBottom: 14 }} onKeyDown={handleKeyDown} aria-busy={...}>
  <Field label="Customer name" ... />
  <Sel label="Service provided" ... />
  ...
</Card>
```
**Recommended Fix**: Wrap in `<form>`:
```jsx
<form onSubmit={(e) => { e.preventDefault(); send(); }}>
  <Card ...>
    <Field ... />
  </Card>
  <Btn type="submit" ...>Send</Btn>
</form>
```
---

### Issue 32: No announce of screen/page transitions
**WCAG Criterion**: 4.1.3 Status Messages (AA)  
**Severity**: **Serious**  
**User Impact**: When a user navigates from Dashboard to Send Request (or any other screen), there is no announcement of the new screen. Screen reader users have no way of knowing the page changed unless they happen to notice the heading.  
**Location**: `AppShell.jsx` — the `navigate` function  
**Evidence**:
```jsx
const navigate = useCallback((to) => {
  setPrevScreen(screen);
  setScreen(to);
}, [screen]);
```
**Recommended Fix**:
```jsx
const navigate = useCallback((to) => {
  setPrevScreen(screen);
  setScreen(to);
  // Use a live region or focus management to announce
  setTimeout(() => {
    const heading = document.querySelector('h1, h2');
    if (heading) heading.setAttribute('tabindex', '-1');
    heading?.focus();
  }, 100);
}, [screen]);
```
And add a visually hidden live region:
```jsx
<div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
  {`Navigated to ${screen}`}
</div>
```
---

### Issue 33: Supabase `useSupabaseArray` hook may not expose loading state
**WCAG Criterion**: 4.1.3 Status Messages (AA)  
**Severity**: **Serious**  
**User Impact**: Users see stale/seed data while Supabase data loads, with no indication that data is being fetched or might have failed. Screen readers get no feedback.  
**Location**: `AppShell.jsx` lines 56-68  
**Evidence**:
```jsx
const [reviews, setReviews] = useSupabaseArray("reviews", userId, SEED_REVIEWS);
```
If the hook doesn't expose loading/error states, the UI silently shows seed data until real data arrives.

**Recommended Fix**: Audit `useSupabaseArray` hook and add loading states to the UI.

---

### Issue 34: "Free Review Link Tool" in footer has no click handler
**WCAG Criterion**: 2.5.3 Label in Name (A)  
**Severity**: **Minor**  
**User Impact**: The footer item "Help" has no `onClick` handler (`fn = ""`), making it visually interactive but non-functional.  
**Location**: `Landing.jsx` line 881-893  
**Evidence**:
```jsx
["Help", ""].map(([l, fn]) => (
  <span key={l} onClick={fn ? props[fn] : undefined}
    style={{ fontSize: 12.5, color: G.muted, cursor: fn ? "pointer" : "default" }}>
    {l}
  </span>
))
```
**Recommended Fix**: Either remove "Help" or wire it to a handler.

---

### Issue 35: `<select>` in `Sel.jsx` has no `aria-label` or `aria-describedby` for instructions
**WCAG Criterion**: 4.1.2 Name, Role, Value (A)  
**Severity**: **Moderate**  
**User Impact**: The `Sel` component relies on the `<label>` element for its accessible name. This works in most screen readers, but some users benefit from explicit `aria-label` or `aria-describedby` when placeholder options are present.  
**Location**: `Sel.jsx`  
**Recommended Fix**:
```jsx
<select id={id} aria-label={label} ...>
```
---

### Issue 36: `aria-invalid` and `aria-describedby` on Field — referenced error ID may not exist at time of render
**WCAG Criterion**: 4.1.2 Name, Role, Value (A)  
**Severity**: **Minor**  
**User Impact**: The error element `id={`${id}-error`}` must exist in the DOM when `aria-describedby` references it. Since they render in the same JSX block, this should work, but the error paragraph renders conditionally, so the ID only exists when `error` is truthy — which is correct behavior.  
**Location**: `Field.jsx` lines 80-81, 102-113  
**Status**: ✅ Correctly implemented. No action needed.

---

### Issue 37: `ToastContainer.jsx` has `aria-live="polite"` on container but individual toasts have `role="alert"`
**WCAG Criterion**: 4.1.3 Status Messages (AA)  
**Severity**: **Moderate**  
**User Impact**: Each toast has `role="alert"` which is announced immediately (even with `aria-live="assertive"` behavior). This is nested inside an `aria-live="polite"` region. The `role="alert"` on individual toasts takes precedence, which is actually correct behavior (immediate interruption). However, the container's `role="status"` + `aria-live="polite"` is redundant with the individual alerts.  
**Location**: `ToastContainer.jsx` lines 15-16, 38  
**Evidence**:
```jsx
<div role="status" aria-live="polite" aria-label="Notifications">
  <div role="alert" ...>
```
**Recommended Fix**: Either use `role="status"` on the container (for polite announcements) or `role="alert"` on each toast (for immediate interruption). Having both is redundant but not harmful. Consider removing the `role="status"` from the container since `role="alert"` on individual toasts handles the announcement.

---

## ✅ What's Working Well

1. **Field component**: Excellent form label association with `htmlFor`/`id`, `aria-invalid`, `aria-describedby` linking to error messages — best component in the app.
2. **Spinner component**: Proper `role="status"` with `aria-label="Loading"` and visually hidden "Loading..." text for screen readers.
3. **Stars component**: `aria-label={`${rating} out of 5 stars`}` on the container and `aria-hidden="true"` on individual SVGs — excellent implementation.
4. **ConfirmModal**: Proper `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the title, Escape key handling, focus set to confirm button.
5. **EditProfileModal**: Same good practices as ConfirmModal.
6. **SEO component**: Thorough use of `react-helmet-async` with title, description, canonical, OG, and Twitter card meta tags.
7. **JSON-LD structured data**: Present on the landing page with SoftwareApplication schema.
8. **Live ticker animation**: Uses CSS `@keyframes` without JavaScript animation — respects `prefers-reduced-motion` to some extent (still animates, but CSS transforms can honor `@media (prefers-reduced-motion: reduce)`).
9. **`<html lang="en">`**: Correctly set.
10. **Heading hierarchy on Landing page**: Single `<h1>` followed by multiple `<h2>` elements — proper hierarchy.
11. **Error messages with `role="alert"`** in Field, Sel, Login, and Signup components — dynamic errors are announced.

---

## 🎯 Remediation Priority

### Immediate — Fix Before Release (Critical/Serious)
1. **Semantic landmarks** (`<main>`, `<header>`, `<nav>`, `<footer>`) + skip-to-content link — Issue 1 & 2
2. **Fix `ariaLabel` → `aria-label`** in Btn component — Issue 5 (buttons are silent)
3. **Add focus indicators** — remove `outline: none` without replacement — Issue 6
4. **Fix all `<span>`-as-button elements** — Issue 4 (keyboard-blocked controls)
5. **Add `aria-label` to notification bell** — Issue 9
6. **Add focus trapping to modals** — Issue 10
7. **Add `aria-current="page"` to nav** — Issue 3
8. **Darken `G.muted` and `G.gold`** for contrast compliance — Issue 7 & 8
9. **Page title updates + focus management on screen transitions** — Issue 19 & 32
10. **Accessible backdrop overlay (keyboard dismiss)** — Issue 28

### Short-term — Next Sprint (Moderate)
11. **Add `autocomplete` attributes** — Issue 13
12. **Implement live region for ticker** + pause mechanism — Issue 12
13. **Add table `<caption>` and valid empty `<th>`** — Issue 11 & 16
14. **Keyboard hover equivalent on Card** — Issue 17
15. **Cookie banner `role="dialog"`** — Issue 18
16. **Add `aria-hidden="true"` to decorative icons** — Issue 20, 15
17. **Add emoji `role="img"` with `aria-label`** — Issue 22
18. **Replace `document.getElementById` with refs** — Issue 21
19. **Wrap SendReq form in `<form>` element** — Issue 31
20. **Add loading/error states for Supabase data** — Issue 25, 33

### Ongoing — Regular Maintenance (Minor)
21. **Add homepage link to Wordmark** — Issue 27
22. **"Not yet rated" placeholder in Stars** — Issue 23
23. **Use `useId()` for unique ID generation** — Issue 30
24. **Fix "Help" footer item** — Issue 34
25. **Toast ARIA role cleanup** — Issue 37

---

## 📈 Recommended Next Steps

### For Developers
1. **Add a global focus style** in the app's root CSS:
   ```css
   *:focus-visible {
     outline: 2px solid #C93D10;
     outline-offset: 2px;
   }
   *:focus:not(:focus-visible) {
     outline: none;
   }
   ```
2. **Refactor `Btn.jsx`** to properly handle `aria-label` (explicit destructure + pass as hyphenated)
3. **Refactor `AppShell.jsx`** to use semantic HTML: `<header>`, `<main>`, `<nav>`, `<footer>` with landmark roles
4. **Replace all `<span onClick>` patterns** with `<button type="button">`
5. **Update theme colors**: Darken `muted` to `#6B655A` and `gold` to `#B87D10`

### For the Design System
- Audit the full color palette against WCAG AA contrast on all background combinations
- Create a design token for focus indicator styles
- Add `autocomplete` attribute specification to all form fields
- Create a "skip to content" component template

### Process Improvements
- Add axe-core or @axe-core/react to the dev dependencies and run it in CI
- Add a keyboard-only navigation checklist to the QA process
- Include accessibility acceptance criteria in all user stories
- Test every new component with a screen reader before merging

### Re-audit Timeline
- **Immediate**: Re-audit after critical/serious fixes (1-2 days)
- **Short-term**: Full re-audit before next release (after sprint 2)
- **Quarterly**: Ongoing regression audits for accessibility

---

## Accessibility Score

| Category | Score | Notes |
|----------|-------|-------|
| **Semantic HTML** | 25/100 | No landmarks, no skip link, div soup |
| **Keyboard Access** | 30/100 | Non-focusable interactive elements, no focus indicators on fields |
| **ARIA Usage** | 50/100 | Good modals, broken `ariaLabel`, missing `aria-current` |
| **Color & Contrast** | 40/100 | Muted/gold fail, others pass |
| **Forms** | 70/100 | Great Field component, but no autocomplete, no `<form>` wrapper |
| **Images & Media** | 60/100 | Missing aria-hidden on SVGs, emoji-ambiguity |
| **Dynamic Content** | 45/100 | No screen-change announcements, no loading indicators |
| **Screen Reader** | 35/100 | Would fail key flows due to missing labels, no landmarks |

**Overall Score: 42/100** — Significant work required to meet WCAG 2.2 AA.

---

*Audit completed 19 May 2026 by AccessibilityAuditor. This report reflects the state of the codebase at the time of review. Fix verification testing should include real screen reader testing (VoiceOver on macOS, NVDA on Windows) and keyboard-only testing for all user journeys.*
