# CLAUDE.md — Working brief & handover · *Simões Madeira 2026*

> This file is the onboarding brief for anyone (human or Claude) working in this repo.
> It is written in English for convenience, **but everything that ships — every string on the
> site, every message to family, every email to a vendor — is in European Portuguese (pt-PT).**
> If you are the Claude GitHub Action, read this file first; it is your project context.

Repo: `adrianoapmartins/simoesmadeira2026` · Live: <https://adrianoapmartins.github.io/simoesmadeira2026>
Last human edits were made **manually, directly in the deployed code** — so this brief is anchored to
what is *actually in the repo right now*, not to any earlier plan.

---

## 0. TL;DR — what this is

A password-gated, mobile-first static website that presents a **22-person extended-family trip to
Madeira (5–10 September 2026)** to the family: programme, hotel, full cost breakdown, and payment
tracking. Adriano is the sole organiser. There is **no build step and no framework** — plain
HTML/CSS/JS served by GitHub Pages.

---

## 1. Golden rules (read before touching anything)

1. **Language: European Portuguese, always.** Every user-facing string is pt-PT. Talking *to* Adriano
   in English is fine; *shipping* anything not in pt-PT is a bug.
2. **Mobile-first, and authored on mobile.** Adriano edits from an iPhone via the GitHub **web UI**
   (pencil → select-all → delete → paste → commit). Deliver changes as either a clean PR or a
   full-file replacement he can paste. Don't hand him a fragment that requires desktop tooling to apply.
3. **Static site, no toolchain.** Vanilla HTML/CSS/JS only. **Do not** add a bundler, framework, or
   package step. **Do not delete `.nojekyll`** — it keeps GitHub Pages from mangling `docs/`.
4. **The password gate is cosmetic.** `PASSWORD` lives in plaintext at the top of `app.js`; the repo
   is public. Never put anything genuinely confidential anywhere in this repo.
5. **Google Maps links use text search, not Place IDs.** Always go through the `mapLink()` helper with
   an `encodeURIComponent` text query (see `PLACES`). Place IDs (`ChIJ…`) produce "No results found"
   in practice — the helper still supports them as a fallback, but don't introduce new ones.
6. **Every restaurant listed must handle a group of 22**, and each is a clickable map link. Don't add a
   venue you haven't sanity-checked for group capacity.
7. **One unified programme for all 22.** The earlier "hiking subgroup" exception has been **removed** —
   see §5 and Thread E. Don't reintroduce a split programme without a deliberate decision.
8. **"Imperdível" experiences happen when all 22 are together** (boat trip, Carros de Cesto), never on a
   staggered subgroup-only day.
9. **Routing must be geographically sane** — no irrational back-and-forth for the coach.
10. **Adriano expects rigour.** Honest trade-offs, not optimistic framing. He catches logical
    inconsistencies and wants reflection *before* implementation. If something doesn't add up
    (see §8), surface it — don't paper over it.

---

## 2. Trip facts (the invariants)

| | |
|---|---|
| **Dates** | Group 1: **5–10 Sep 2026** · Jorge's family (Group 2): **6–11 Sep 2026** |
| **Hotel** | Pestana Carlton Madeira, Funchal — **9 rooms**, half board (breakfast + dinner; drinks at dinner NOT included) |
| **Headcount** | **22 people**: 18 priced as adults (incl. Tiago, 17), 3 children (8/6/4), 1 baby (Aurora, 1) |
| **Group 1 on the ground** | **17 people** (16 on easyJet KCL63HT + Pedro, who flies separately) |
| **Group 2** | **5 people** — Jorge's family, easyJet KCL63SQ |
| **Arrival flights** | G1: **EJU6863, lands 08:30, Sep 5** · G2: **EJU6831, lands 09:05, Sep 6** |
| **Departure** | G1: **EJU6834, 15:15, Sep 10** · Jorge's family departs **Sep 11 (own taxi — see Thread D)** |

### The 22, by room/family (category drives pricing)

| Family (room) | People (age · category) |
|---|---|
| **Alexandra** — Twin Family | Adriano (38·ad), Alexandra (38·ad), Ana (4·child), Aurora (1·baby) |
| **Farrulo** — Twin Classic Pool View | Manuel R. (59·ad), Conceição (58·ad) |
| **Pedro** — Twin Classic City View | Pedro (31·ad) *(flies separately)* |
| **Patricia** — Twin Family | Patrícia (37·ad), Michael (41·ad), Madalena (8·child), Emília (6·child) |
| **Carmo** — Twin Classic Pool View | Manuel O. (67·ad), Carmo (61·ad) |
| **Luís** — Twin Classic Pool View | Luís (33·ad), João Pedro (22·ad) |
| **Ana Maria** — Twin Classic Pool View | Filipe (46·ad), Ana Maria (60·ad) |
| **Jorge** — 2 rooms (Family 3-pax + Pool View) | Tiago (17·ad), Fátima (48·ad), Jorge (48·ad), Jorge Miguel (25·ad), Susete (25·ad) |

Categories: **adult** pays real flight + meals (€200) + attractions (€43) + ecotax (€10) · **child (4–12)**
pays real flight + meals (€100) + attractions (€16) · **baby (<2)** pays only flight (€62) + bag share +
transport share (no ecotax, meals, or attractions).

---

## 3. The website (architecture)

**File map**

| File | Role |
|---|---|
| `index.html` | Structure, meta/Open-Graph tags, the 5 tabs, static fallback numbers, payment-method buttons |
| `styles.css` | Design — *Madeira green*, fonts **Fraunces** (display) + **Manrope** (body) |
| `app.js` | **All the data + logic**: password gate, tabs, programme, cost model, payments |
| `docs/` | Downloadable PDFs — easyJet receipts + hotel reservations |
| `hotel-hero.jpg` / `social-card.jpg` | Hero background · WhatsApp/OG preview (1200×630) |
| `.nojekyll` | Disables Jekyll so `docs/` is served as-is — **keep** |
| `README.md` | Deploy/hosting notes (pt-PT) |

**Tabs:** `Resumo` · `Hotel` · `Programa` · `Custos` · `Pagamentos`. Tab is reflected in the URL hash
(e.g. `…/#pagamentos`) so deep links open the right tab.

**Where the data lives in `app.js`** (these are the things you'll usually edit):
- `programa[]` — day-by-day itinerary (timeline, hikes/walks, boat, restaurant suggestions, map spots)
- `categorias{}` + the `PRECO_*` / `BUS_*` constants — the cost model and the per-category breakdown modals
- `reembolsosVoos[]` — per-family, per-person flight reimbursement tracking
- `reservasVoos[]` / `reservasHotel[]` — the booking receipts shown in *Pagamentos*
- `PLACES{}` + `mapLink()` — map search strings and link builder
- `familias[]` + `nomesCurtos{}` — people, rooms, hotel costs, friendly names

**Marking a payment as paid:** set `pago: true` on a person (or the whole family) in `reembolsosVoos`.
Family status ("pago / parcial / por pagar") is computed automatically. *(As of now, everything is
`true` — see §6.)*

**WhatsApp/OG preview:** meta tags point at the absolute `social-card.jpg` URL. If a stale preview
shows, share the link with `?v=2` appended; validate at opengraph.xyz.

---

## 4. Current programme (DEPLOYED — this is the source of truth)

> ⚠️ This **supersedes** any earlier plan that featured Pico do Arieiro or a separate hikers' route.
> The live programme is a single, accessible itinerary for all 22 (baby + small children friendly).

- **Sat 5/9 — Arrival · Funchal** *(Group 1 only; Jorge's family not yet here)*
  Land 08:30 → drop bags at the hotel (check-in 15:00) → Mercado dos Lavradores → historic centre
  (Sé, Rua de Santa Maria) → lunch → **Teleférico do Monte** up → **Carros de Cesto** down → pools.
  *Carros de Cesto deliberately on an all-Funchal, low-key first day.*
- **Sun 6/9 — North · Santana** *(first full-group day)*
  Leave hotel **08:30** → **09:30 collect Jorge's family at the airport** (22 regroup here) → Casas
  Típicas de Santana → easy walk **PR9.1 "Um Caminho para Todos" (Pico das Pedras → Queimadas)**,
  flat & accessible → Ribeiro Frio. *Coach can't reach Queimadas; group walks from Pico das Pedras.*
- **Mon 7/9 — Sea & East**
  **Boat trip (dolphins/whales)** from Marina do Funchal, ~2h30 → Ponta de São Lourenço miradouros
  (short version of **PR8** for everyone; the longer trail is optional for the able-bodied).
- **Tue 8/9 — West · Cabo Girão**
  Cabo Girão glass skywalk → Câmara de Lobos (poncha) → *espetada* lunch → Praia da Calheta.
- **Wed 9/9 — Northwest · Porto Moniz**
  Paúl da Serra plateau → **Fanal** laurel forest (free wander) → Porto Moniz lava pools.
- **Thu 10/9 — Departure (Group 1)**
  Free morning → check-out 12:00 → transfer to airport → EJU6834 15:15. *Jorge's family stays until 11/9.*

---

## 5. What changed from the earlier plan (so it isn't accidentally undone)

The repo no longer contains, and intentionally so:
- ❌ **Pico do Arieiro** drive-to-summit on Day 6 → replaced by **Santana + PR9.1** (accessible walk).
- ❌ **A ~6-person hiking subgroup** doing **PR1** (Achada do Teixeira) and the full **PR8**, with its own
  transfers and **SIMplifica fees** → removed entirely. The programme is now unified; Day 7's PR8 is the
  short version for all, longer-for-the-able as an informal option.
- ❌ **Museu da Baleia** → removed from programme and budget, replaced by the boat trip.

If a future task asks to "add the hikers' day back," treat it as a real product decision and confirm with
Adriano — don't silently reinstate it.

---

## 6. Cost & payment state

**Headline (static fallbacks in `index.html`; the live figures are computed from the data):**
total ≈ **€23,857** (~€1,085/person) · *pago já* ≈ €18,355 · *pago depois* ≈ €5,502.

**The model — "pago já" vs "pago depois":**
- **Pago já** (paid up front / soon): Hotel · easyJet flights · coach (Planeta Azul) · ecotax
- **Pago depois** (settled on the ground): attractions · boat · lunches + drinks
- **Shared by room:** hotel. **Shared by all 22:** coach (everyone needs a seat). **Individual:** flight,
  ecotax, attractions, meals.

**Category reference (computed):**

| Category | ≈ Total | Notes |
|---|---|---|
| Hotel | €12,665 *(calculator)* / **€12,845.40** *(receipts)* | ⚠️ two figures disagree — see §8 |
| Flights (easyJet) | €3,714.08 | KCL63HT €2,957.30 + KCL63SQ €756.78 |
| Coach (Planeta Azul) | €1,795.80 | 6 days, +4% VAT, split per-day by who's present |
| Lunches + drinks | €3,900 | estimate: €40/adult/day, €20/child/day × 5 |
| Attractions | ~€1,000 | estimate; small kids mostly free/reduced |
| Boat | ~€780 | **estimate only** — vendor not yet confirmed (Thread A) |
| Ecotax | €180 | €2/night × 5, 18 eligible (under-13s exempt) |

**Reimbursement status — IMPORTANT, and current:**
- Adriano personally pre-paid **only the easyJet flights** (€3,714.08). The **hotel is paid at the
  hotel**, so it never entered the reimbursement pool.
- **All 7 family groups have now reimbursed Adriano in full** for the flights → **€0 outstanding**.
  Everyone is square on every currently-known/pending expense. *(This is the recent manual edit: every
  `pago` flag in `reembolsosVoos` is `true`.)*
- Remaining costs (meals, attractions, boat) are **paid individually during the trip** — there is no
  further pot to collect right now.
- Payment methods (MB WAY + IBAN) remain configured in `index.html` (Pagamentos tab) but are effectively
  dormant now that everyone has paid.

---

## 7. Open decision threads

> The point of this section: anyone picking the project up should know exactly what's still live.

**A — Boat excursion vendor · OPEN (highest-priority open item)**
- The site shows the boat as an **estimate** (~€40/adult) on **Mon 7/9**, ~2h30 from Marina do Funchal.
- **Four candidates to quote for a 20+ group:** *Bonita da Madeira*, VMT Madeira, Magic Dolphin, OceanSee.
  Adriano's leaning is **Bonita da Madeira**, but it is **not locked** in the code.
- **Next:** get group quotes, choose one, then update the `barco` block in `programa[]` and the `barco`
  category (replace the estimate with the real price, name the operator). Note sightings aren't guaranteed.

**B — Planeta Azul (coach) confirmation + deposit · PARTIALLY DONE**
- Pricing is already baked into the site (6 days, +4% VAT). Contact: **Mariana Freitas**.
- **Pending:** vendor booking confirmation and a **~10% deposit (~€179.58)** by bank transfer, **waiting on
  Mariana's IBAN**. The deposit/IBAN is operational and not shown on the public site.

**C — Day 6 timing with Mariana · VERIFY**
- Deployed schedule: leave hotel **08:30** → airport pickup of Jorge's family **09:30**.
- Earlier there was a conflict between the hotel-departure time (~08:45) and Mariana's **quoted 09:30
  service start**. Confirm with her that the service clock covers the **08:30 hotel departure**, not just
  from 09:30 — otherwise the Day-6 morning is under-covered.

**D — Jorge's family return transfer (11/9) · KNOWN GAP**
- Their **Sep 11 airport trip is by taxi and is NOT covered by Planeta Azul.** Flagged on the site
  (minibus note). Make sure it actually gets arranged closer to the date.

**E — Hiking subgroup · RESOLVED (dropped)**
- Documented in §5. Kept here only so it isn't mistaken for an oversight. Do not reinstate without a
  deliberate decision.

---

## 8. Consistency items to reconcile (Adriano-style rigour)

These are real, currently-in-the-code discrepancies worth fixing or explicitly justifying:

1. **Hotel total disagrees with itself.** The cost calculator (sum of `familias[].hotel`) gives
   **€12,665**, but the booking receipts (`reservasHotel`) total **€12,845.40** — a **~€180 gap**
   (suspiciously close to the €180 ecotax). Decide which is canonical, align the two, or document why
   they legitimately differ.
2. **Boat day label is wrong in one place.** The `barco` category intro says *"(dia 6…)"* but the
   programme correctly puts the boat on **Mon 7/9**. Fix the category text to say day 7.
3. **Dead reference.** `PLACES.museuBaleia` is still defined even though Museu da Baleia was removed.
   Harmless, but can be deleted.
4. **Static headline numbers drift.** The figures hard-coded in `index.html` (€23,857, €18,355, etc.) are
   overwritten at runtime by the computed values. If the data model changes, those fallbacks won't — treat
   them as placeholders, not truth.

---

## 9. How Claude is wired into this repo

Two GitHub Actions (both delegate to reusable workflows in `adrianoapmartins/.github`):

- **`claude.yml`** — triggers on **`@claude`** mentions in issues, issue comments, PR review comments, and
  PR reviews; also when an issue is opened/assigned containing `@claude`. Runs with read permissions and
  proposes changes via PR.
- **`claude-code-review.yml`** — runs an **automatic review on every PR** (opened / synchronize /
  ready_for_review / reopened).
- **Issue template `Task`** (`.github/ISSUE_TEMPLATE/task.md`) — Goal / Context / Success criteria / Out of
  scope. This is the ideal shape for an `@claude` task; fill it in and mention `@claude`.

Practical implication: Claude works through **PRs**, and **Adriano reviews/merges on mobile**. Keep diffs
small, self-contained, and paste-friendly; explain the change in the PR body in plain language.

---

## 10. Working conventions & preferences

- **WhatsApp messages to the family:** pt-PT, **short**, **`*asterisk bold*`** (WhatsApp syntax), and
  delivered **inside a fenced code block** so Adriano can copy them in one tap.
- **Searching vendor docs across versions:** target revision signals — *revisto*, *atualizado*, *segundo* —
  to avoid grabbing a stale quote.
- **Diagnosing a stale GitHub Pages cache:** search for a known *new* string in the **GitHub blob view**
  of the file, not the live site, to tell whether a change actually landed.
- **Editing flow:** GitHub web UI on iPhone (pencil → select-all → delete → paste → commit).
- **Tone:** direct, honest trade-offs, flag inconsistencies, reflect before implementing.

---

## 11. Vendors & contacts (quick reference)

| Need | Vendor | Contact / refs |
|---|---|---|
| Hotel | **Pestana Carlton Madeira** | Dora Antunes · 9 rooms · receipts `26050582202` (G1, 7 rooms) + `26050582317` (G2, 2 rooms) |
| Coach / transfers | **Planeta Azul** | **Mariana Freitas** · 31-seat coach for excursions, 20-seat minibus for transfers · deposit pending IBAN |
| Boat (dolphins/whales) | **TBD** | Candidates: **Bonita da Madeira** *(leaning)*, VMT Madeira, Magic Dolphin, OceanSee |
| Flights | **easyJet** | **KCL63HT** (G1, 5–10 Sep) · **KCL63SQ** (G2, 6–11 Sep) — receipts in `docs/` |

---

*Keep this file current.* When a thread in §7 closes or a number in §6/§8 is reconciled, update it here so
the next person (or the next Claude) starts from truth.
