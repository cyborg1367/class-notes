# Class Notes

A Persian, right-to-left classroom portal for course notes, quizzes, and hands-on Python labs. Built around a paper-inspired interface, it combines a static GitHub Pages frontend with authenticated learning services powered by Supabase.

Students can read course material, practice code in their browser, submit lab missions for independent grading, and follow their progress through server-recorded XP.

 · [Build workflow](.github/workflows/jekyll-gh-pages.yml)

## What students can do

- **Study course material:** access authorized lesson content, mathematical notation, and supporting resources.
- **Check their understanding:** complete lesson quizzes and track learning progress.
- **Practice Python:** write code in an editor with syntax highlighting and an adjustable output console.
- **Complete guided missions:** explore a scenario and its dataset, solve tasks, and receive diagnostic feedback with optional hints.
- **Earn XP:** receive credit for successfully graded missions and see progress in the dashboard.

### Current labs

| Lab | Learning focus | Missions | Available XP |
| --- | --- | ---: | ---: |
| Greenhouse Detective | Dataset shapes, vector distances, nearest neighbors, and comparing queries | 6 | 300 |
| SMS Detective | Labeled examples, neighbor voting, majority decisions, and k-nearest-neighbor classification | 6 | 300 |

The SMS lab uses synthetic messages and prepared numeric features. Students work with those features rather than implementing a text-processing pipeline.

## Architecture

The public website and the private classroom services have separate responsibilities.

| Component | Responsibility |
| --- | --- |
| GitHub Pages | Serves public HTML shells, styles, scripts, and public configuration |
| Supabase Auth | Handles student sign-in and sessions |
| Supabase database and Storage | Enforce access to private materials and store learning state |
| Pyodide in a browser worker | Runs local Python practice and displays its output |
| Supabase `classroom-lab` Edge Function | Authenticates grading requests and coordinates independent checks |
| E2B | Runs server-side lab evaluation in a sandbox |

**A successful browser run does not award XP.** The server verifies submissions and returns the authoritative progress snapshot. Repeating an already completed mission does not award its XP again.

GitHub Pages hosts the frontend; it does not run Python grading or provide a trusted database.

## Repository layout

```text
.
├── .github/workflows/   # GitHub Pages build and deployment
├── web/                # Public website source
│   ├── assets/         # Styles, scripts, fonts, and public configuration
│   └── ...             # Account, course, lesson, and lab pages
├── build.py            # Validates public configuration and creates dist/
├── check.py            # Checks generated pages and public-output safety
├── README.md           # English project overview
└── README.fa.md        # Persian instructor guide
```

`dist/` is generated output and is not committed. Instructor-only server code, migrations, reference solutions, and private test packages are intentionally excluded from the public repository.

## Local setup

### Requirements

- Python 3 to build and check the public website.
- A modern browser to use the portal and coding labs.
- A configured Supabase project for authenticated classroom features.
- The matching instructor backend package and E2B configuration for trusted lab grading.

The frontend build uses Python's standard library; no npm install is required.

### 1. Get the source

Clone this repository and open a terminal in its root directory, alongside `build.py`.

### 2. Set public configuration

`web/assets/auth-config.json` contains only the Supabase project URL and its **publishable** key:

```json
{
  "supabaseUrl": "https://YOUR_PROJECT.supabase.co",
  "publishableKey": "sb_publishable_YOUR_PUBLIC_KEY"
}
```

`web/assets/lab-service.json` points to the grading endpoint in the same project:

```json
{
  "checkURL": "https://YOUR_PROJECT.supabase.co/functions/v1/classroom-lab/check"
}
```

These values are public by design. They identify the backend; they do not replace database policies, membership checks, or authenticated server-side authorization.

For an existing classroom installation, preserve its configuration when applying frontend updates. Configure allowed authentication redirect URLs for your deployed site and any local development origin you use.

### 3. Build and validate

```bash
python3 build.py
python3 check.py
```

The builder creates `dist/`. The checker validates the generated site, including relative links, page requirements, and checks against accidental exposure of private classroom content or known secret-key patterns.

### 4. Preview

```bash
python3 -m http.server 8000 --directory dist
```

Open <http://localhost:8000>. Serve **`dist/`**, rather than opening HTML files directly. Sign-in, private lessons, and grading also require a correctly configured backend; a local static preview alone does not provision those services.

## Deploy to GitHub Pages

1. In the repository's **Settings → Pages**, select **GitHub Actions** as the build source.
2. Commit your public source changes and push them to `main`.
3. The Pages workflow runs `build.py` and `check.py`, uploads `dist/`, and deploys the generated site.
4. Confirm that the workflow succeeds before checking the deployed classroom.

The workflow can also be started manually from the **Actions** tab. Backend deployment is separate: publishing the static site does not apply SQL migrations or deploy a Supabase Edge Function.

## Security boundaries

- **Keep secrets on the server.** Never place Supabase secret/service-role keys, E2B API keys, or other credentials in `web/`, frontend configuration, or public Git history.
- **Protect private resources with backend authorization.** A hidden navigation item or a client-side route check is not an access policy.
- **Trust server results for progress.** Browser output, local drafts, and UI animations are not proof of a passed mission.
- **Keep grading material private.** Do not publish hidden checks, reference solutions, instructor-only packages, or migration bundles with the website.
- **Review the generated output.** Build checks help catch mistakes but do not replace a review of database policies, Edge Function authorization, or backend configuration.

The frontend uses PKCE authentication and constrains the configured grading endpoint to the same Supabase project. Backend protections must still be installed and maintained separately.

## Maintenance and updates

- Make public website changes in `web/`, then rebuild and run the checks.
- Keep the existing paper-inspired, Persian RTL interface and keyboard accessibility intact when changing the UI.
- Review changes to Python execution, grading, and XP separately from presentation changes.
- Follow the instructor instructions supplied with each release. Some updates change only frontend files; others also require backend deployment or a migration.
- Review staged files before pushing, particularly when unpacking an instructor update beside the repository.

## Scope

This project is designed for an instructor-managed classroom. The public repository provides the website, not a complete one-command backend installation. A working production classroom also needs its private materials, membership policies, database functions, storage rules, grading service, and provider credentials configured by the instructor.

Third-party assets retain their respective licenses and notices; see the bundled dependency directories for details.
