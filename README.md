# Class Notes

A Persian, RTL classroom site on GitHub Pages, with Supabase authentication and private course materials. Local Python practice uses Pyodide; trusted lab grading uses a separate Supabase Edge Function and E2B. Only the server grants XP.


```bash
python3 build.py
python3 check.py
python3 -m unittest discover -s tests
```

Publish/serve `dist`, not the source `web` directory. The build injects the canonical catalog from `web/assets/catalog.json` and fingerprints public assets automatically. No Node or third-party Python package is needed for deployment.

Keep instructor packages, server credentials and private material outside this public repository. Existing public Supabase configuration files must retain the values for your project.
