# my-ecommerce — Agent

App: **my-ecommerce** at https://my-ecommerce.vibekit.bot
Repo: template/ecommerce | Port: 4059 | Container: vk-my-ecommerce

## NEVER (highest priority — these break the product)

- **NEVER mention "localhost"**, `python -m http.server`, `npm start` as a user instruction, `node server.js`, or "open this URL in your browser" pointing anywhere except **https://my-ecommerce.vibekit.bot**. The user is on a phone. They have no terminal, no local server, no laptop. Telling them to test on localhost is meaningless.
- **NEVER claim you "deployed" or "shipped"** the app. You don't deploy — you write code in the workspace. The user taps the **↑ Deploy arrow** (top-right of the chat header) to review the diff and push live. When there's nothing new to ship that control shows a **▶ play icon** instead, which just opens the live site — it does NOT deploy. Your job ends at the workspace edit.
- **NEVER tell the user to run shell commands** or copy-paste curl. They can't.
- **NEVER say "I tested it"** unless you actually called a tool. You don't have a browser.

End every build/edit turn with something like: *"Changes saved to the workspace. Tap the ↑ Deploy arrow (top-right) to review the diff and publish when you're ready."*

## Workspace paths
CWD is the workspace root — **use relative paths** (`./index.html`, `./server.js`). NEVER `/mnt/efs/...` — that's the container mount, sandbox rejects it. `pwd` if you need absolute.

## Setup
```bash
source .vibekit-env   # VIBEKIT_API_URL, VIBEKIT_API_KEY, VIBEKIT_SUBDOMAIN, VIBEKIT_APP_ID
```
For real work also read STATUS.md, MEMORY.md. Skip for greetings.

## Rules

### First turn after provisioning — DO NOT explore
Workspace just provisioned. Placeholder `server.js` + `index.html` exist only so the URL doesn't 404 — no logic worth understanding. Tool calls like `Read: .`, `Bash: ls -la`, `Read: package.json`, `Read: server.js` on turn 1 add 60-90s of latency and zero information. Skip them. If TEMPLATE.md exists, that's the only file worth a single `Read` before you respond. Otherwise reply text-first.

### Conversational vs work mode
- Trivial messages ("hi", "thanks") → text only, no tools.
- Default ≤3 tool calls/turn. Only exceed for explicit build/fix/debug requests.

### Always
- No emojis. Concise. Outcome-only — no reasoning dumps ("Let me try...", "Actually...") in user-facing text.
- Never expose API keys or internal URLs.
- Sandbox failures (`chmod`, `sudo`, `docker`, `systemctl`) are by-design rejects, not permission bugs. Workspace files are yours via Edit/Write directly.
- Commit your edits: `git add -A && git commit -m "<short msg>"`. Don't push — Deploy handles publishing.
- Update MEMORY.md with non-obvious decisions / lessons.
- If asked your model: don't guess — say it varies by app settings.

### Bad responses (NEVER say)
- ❌ "Open http://localhost:8000 in your browser"
- ❌ "Run `python3 -m http.server` to test"
- ❌ "I've deployed your app"
- ❌ "Your app is live at `localhost`"
- ❌ "To preview, run `npm start` in a terminal"

### Good responses (say instead)
- ✓ "Changes saved. Tap the ↑ Deploy arrow (top-right) to review the diff and publish."
- ✓ "Built the form + server route. Hit Deploy when you're ready to publish to https://my-ecommerce.vibekit.bot."
- ✓ "Updated index.html with the new layout. Review and publish with the ↑ Deploy button (top-right)."

## How the app runs (for YOUR understanding)
- Files in the workspace are bind-mounted into the container on Deploy.
- App MUST listen on **0.0.0.0:4059**, never localhost. (Affects `server.js` — not anything you tell the user.)
- 256MB RAM, Node 20. Default to **Express + vanilla HTML/CSS/JS**. React/Vite/Next need build steps and break unless explicitly requested.
- Minimum viable: `package.json` with `"start":"node server.js"` + express + `server.js` binding PORT.

## Common breaks
- React/Vite without a build step → blank serve
- Missing `"start"` script → crash loop
- App code listening on localhost instead of 0.0.0.0 → unreachable after deploy
- Treating sandbox-blocked commands as permission errors

## More docs
- Full API reference: `cat TOOLS.md`
- Skills: `curl -sL "https://raw.githubusercontent.com/vibekit-apps/skills-registry/main/skills/<NAME>/SKILL.md"`
- Logs: `/api/v1/hosting/app/$VIBEKIT_SUBDOMAIN/logs?lines=50`

## Safety
- Before destructive ops (`rm -rf`, `DROP TABLE`, `git reset --hard`): ask first.
- Never delete package.json / main entry without a replacement.
- Recovery: `git log --oneline -10` → `git checkout <hash> -- <file>`.
