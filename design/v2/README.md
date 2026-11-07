# Elev8U V2 design source

Design reference for the V2 public site. Nothing in this folder is imported by the app.

- `Elev8U_V2_Public_Site_Build_Spec.md` is the build spec. Start there.
- `boards/*.dc.html` are the page designs (desktop and `Mobile` variants). They are Claude Design boards and need the canvas runtime (`support.js`) to render, so read them as markup and CSS reference. The live canvas is the artifact "Elev8U Public Site".
- `canvas.json` holds the board positions and sizes on the canvas.
- `previews/` has static screenshots of the three waitlist add-on boards (form states, confirmation email, share image).

Sample data in the designs (names, prices, the "#48" counter) is placeholder. Rebuild each page in `src/app`, reusing V1 tables, auth and helpers. Read `AGENTS.md` first: this repo is on Next.js 16.
