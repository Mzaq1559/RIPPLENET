# Hackathon Demo Guide

## Demo objective

Show how RippleNet turns a persisted assistance request into an explainable operational review. The strongest demo is not “AI makes the decision”; it is **five bounded AI perspectives plus source evidence, transparent uncertainty, database-backed operations, and a human decision-maker**.

## Before presenting

- [ ] Use a dedicated demo database, not production or personal data.
- [ ] Seed a small, coherent set of camps, volunteers, requests, and inventory.
- [ ] Confirm demo accounts and passwords from the seed script; change/remove defaults before any public deployment.
- [ ] Set valid server-side `DATABASE_URL`, `DIRECT_URL`, and `GROQ_API_KEY`.
- [ ] Confirm the configured `GROQ_MODEL` is available to the account.
- [ ] Run `npm run build`.
- [ ] Start the app and verify login, queue, request detail, volunteer task view, and public status lookup.
- [ ] Open one request and verify the five agents show their actual completion/failure status, model, summary and evidence.
- [ ] Verify the second page load reuses the cached analysis.
- [ ] Trigger an explicit refresh and confirm a new evaluation timestamp.
- [ ] Have a fallback recording or screenshots ready in case an external provider is unavailable; label any recording as a previous run, not live inference.

## Suggested 4–5 minute run of show

1. **Problem (30 sec):** emergency requests compete for limited volunteers and supplies; a simple priority label is not enough.
2. **Request intake (45 sec):** show a citizen request and its tracking/status experience using synthetic data.
3. **Camp queue (45 sec):** show persisted requests and explain that the numeric score is a deterministic heuristic.
4. **AI analysis (90 sec):** open a request and walk through Flood, Health, Logistics, Route, and Resource agents. Point to evidence and limitations, including any unavailable inputs.
5. **Human operations (45 sec):** show inventory and volunteer task workflows. Explain that AI suggestions do not reserve stock or dispatch a volunteer.
6. **Transparency (30 sec):** show persisted analysis/cache behavior and explain how human review remains in control.

## Strong demo narrative

- **Flood:** “This is precipitation evidence, not a claim about flood depth or inundation.”
- **Health:** “The agent highlights explicitly reported signals and refers clinical decisions to qualified staff.”
- **Logistics:** “The model suggests a parcel; the server checks item/unit availability against the camp's database stock.”
- **Route:** “This is road-network distance and estimated duration. We do not claim the route is passable during a flood.”
- **Resource:** “We deliberately show costs as unavailable until a verified price catalog exists rather than inventing a budget.”

## Do not claim

- That the AI predicts actual flood inundation, depth, or river levels.
- That health analysis is a diagnosis or medical prescription.
- That inventory is reserved, deducted, or automatically replenished by the AI.
- That OSRM confirms a road is open or safe.
- That a volunteer has been dispatched merely because a route or parcel suggestion exists.
- That cost optimization is active without a verified price dataset.
- That the system is production-ready or certified for emergency operations.
- That the static `/demo` scenario page is live Groq inference.

## Failure plan

- If Groq is down or rate-limited, explain that the live agent result is unavailable and show a clearly labelled prior recording if needed.
- If weather is unavailable, show the unavailable state; do not substitute fabricated rainfall.
- If OSRM is unavailable, show that route evidence could not be retrieved.
- If the database is unavailable, stop the live workflow rather than pretending the request was persisted.
- Do not repeatedly refresh the analysis; five concurrent calls can consume provider quota.

## After the demo

Capture only synthetic records in screenshots. Remove temporary credentials, rotate any key exposed during preparation, and clean demo data from the dedicated demo database if required.
