# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A **Workday Extend** application (`skillet_danno_cdrrjp`) built for the Workday Extend Hackathon. It augments Workday's native competency capabilities with custom extended attributes and AI-powered employee matching. There are no traditional build, lint, or test commands — all files are Workday Extend configuration artifacts deployed directly to a Workday tenant via the Extend Studio.

## Deployment

Changes are deployed by uploading the skillet package to a Workday Extend tenant. The `appManifest.json` at the root of `skillet_danno_cdrrjp/` defines the app identity (`referenceId: skillet_danno_cdrrjp`, `organizationId: 627e4d5f-...`).

## Architecture

### Model (`model/`)
- `CompetencyExtended.businessobject` — Custom Business Object that extends core Workday competencies. Uses `compWorkdayID` (TEXT, `isReferenceId: true`) as the foreign key linking to the Workday competency WID. Extended fields: `trainingType`, `trainingFreq`, `manufacturer`, `equipmentName`, `modelNumber`, `location`, `costCenter`, `discipline`, `competencyType`, `riskTier`, `lastRetrainingDate`.
- `CustomCompetency.securitydomain` — Security domain scoping access to the BO.

### Presentation (`presentation/`)
Pages are JSON files (`.pmd`) using Workday Extend's presentation metadata format. Page logic is written in an embedded expression language: `<% expression %>`.

| Page | Purpose |
|------|---------|
| `competencyLanding.pmd` | App entry point with navigation card |
| `competencyCreate.pmd` | EDIT page to create a competency; conditionally shows extended fields based on category |
| `competencyViewEdit.pmd` | View/edit an existing competency |
| `findEmployeesByCompetency.pmd` | AI-assisted worker search with match scoring |

**`findEmployeesByCompetency.pmd`** is the most complex page. It builds dynamic WQL queries across filters (competency, category, location, department, manager, active-only), computes per-worker match percentages client-side in the `onClick` handler of `btnFindMatches`/`btnSearch`, and renders results via a `dynamicSection` loop using the `employeeMatchCard`.

**`competencyCreate.pmd`** conditionally shows equipment/training fields when the selected category includes Equipment (`61aa27fd07051000cff37dbf8fa30000`), Job Specific, or Location Specific WIDs. The save flow: invoke the orchestration → look up the new WID by name via WQL → optionally POST to the BO API.

### Orchestration (`orchestration/`)
`competencyCreateUpdate.orchestration` handles both create and update in one flow (controlled by the `createOrUpdate` field in the request body):

- **Create path**: SOAP POST to `soap/v46.0/Performance_Management` (`Put_Competency_Request`, `Add_Only=false`, no WID reference). Parses returned WID from XML via XPath `//wd:ID[@wd:type='WID']`. Then conditionally POSTs a `CompetencyExtended` BO record if `trainingType` is provided.
- **Update path**: Same SOAP call with a `<Competency_Reference><ID type="WID">` block. Then WQL-queries the BO (`z_practiceappdb_jrhrrz_competencyExtendeds`) to check if an extended record exists. Uses PATCH if it does, POST if not.

**Credentials used**:
- `_DEFAULT_WORKDAY_CREDENTIAL` (SSO / initiating user token) — for SOAP and WQL calls
- `lXa3TjGK` (`ISU_ExtendHackApp`) — for BO REST API calls (`/apps/{appReferenceId}/v1/competencyExtendeds/`)

### Agents (`agents/`)
- `competency-matcher.agent` — AI agent triggered by the "Find Matches" button. System prompt instructs it to call the `find-workers-by-competency` skill, rank results by match %, and present name/title/location/match details.
- `find-workers-by-competency.agentskill` — Uses Workday tools `find_staffing_workers` (WID: `30aeb92af72e100063e2955a0eff0000`) and `list_worker_direct_reports` (WID: `0466c187aaa2100059952028eda60000`). Checks `activeCompetencySkills` on returned workers to compute match percentages.

### Cards (`presentation/cards/`)
- `competencyNavCard.card` — Navigation card on the landing page.
- `employeeMatchCard.card` — Renders a single worker result; receives `employeeName`, `jobTitle`, `location`, `matchScore`, `matchColor`, `photoID`, and `competencies` as parameters.

## Key Patterns

**WQL endpoints**: All data lookups use `baseUrlType: workday-wql` with `deferred: true`. The URL expression builds a WQL string and calls `.pathEncode()` or `.urlEncode()`. The `allCompetencies`, `allActiveAndTerminatedWorkers`, `allWorkers`, `locationsUsedAsBusinessSite`, and `costCenters` are the main WQL data sources.

**Extended field visibility**: On create/edit pages, the equipment-specific fields (`manufacturer`, `equipmentName`, `modelNumber`) are hidden by default and shown via `setVisible()` in `onChange` handlers when the relevant category WIDs are selected.

**BO table name**: The Extend BO is queried via WQL as `z_practiceappdb_jrhrrz_competencyExtendeds` and accessed via REST at `/apps/skillet_danno_cdrrjp/v1/competencyExtendeds/`.

**Match scoring**: Computed entirely in the PMD expression language. For each worker, the code counts how many of the selected competency WIDs appear in `worker.activeCompetencySkills`, then calculates `pct = matchedCount * 100 / totalSelected`. Strong ≥ 80%, Good 60–79%, Partial < 60%.
