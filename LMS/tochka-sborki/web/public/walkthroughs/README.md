# walkthroughs/

Self-contained "Learn-mode walkthrough" HTML files, exported from the sovern-mindmap app
(**Export Learn HTML**). Each is a fully self-contained interactive step-through (cumulative
node reveal + per-step narration + prev/next + keyboard, neutral hybrid background that reads on
both light and dark pages, **zero external resources**).

## Authoring flow (manual, one-shot)
1. In the mindmap app, build a SMALL diagram (~5 nodes — cumulative inline-SVG frames get heavy;
   ~22 MB at 13 nodes) and click **Export Learn HTML**.
2. Drop the exported `<slug>.html` into this folder.
3. Embed it in a unit with the `<Walkthrough>` MDX component:
   ```mdx
   <Walkthrough slug="my-diagram" title="How the pipeline assembles" />
   ```

## Notes
- No code dependency on the app — the file keeps working if the app goes away.
- Static asset + sandboxed `<iframe>` only. **Never** cross-import app sources into `workers/`
  (monorepo relative-import / @-alias tsc trap).
- Optional: a walkthrough can also become a showcase-gallery item on home.
