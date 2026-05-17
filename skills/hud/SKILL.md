---
name: hud
description: Configure HUD display options (layout, presets, display elements)
---


# HUD Skill

Configure the OMC HUD (Heads-Up Display) for the statusline.

Note: All `~/.claude/...` paths in this guide respect `CLAUDE_CONFIG_DIR` when that environment variable is set.

## Quick Commands

| Command | Description |
|---------|-------------|
| `/oh-my-claudecode:hud` | Show current HUD status (auto-setup if needed) |
| `/oh-my-claudecode:hud setup` | Install/repair HUD statusline |
| `/oh-my-claudecode:hud minimal` | Switch to minimal display |
| `/oh-my-claudecode:hud focused` | Switch to focused display (default) |
| `/oh-my-claudecode:hud full` | Switch to full display |
| `/oh-my-claudecode:hud status` | Show detailed HUD status |

## Auto-Setup

When you run `/oh-my-claudecode:hud` or `/oh-my-claudecode:hud setup`, the system will automatically:
1. Check if `~/.claude/hud/omc-hud.mjs` exists
2. Check if `statusLine` is configured in `~/.claude/settings.json`
3. If missing, create the HUD wrapper script and configure settings
4. Report status and prompt to restart Claude Code if changes were made

**IMPORTANT**: If the argument is `setup` OR if the HUD script doesn't exist at `~/.claude/hud/omc-hud.mjs`, you MUST create the HUD files directly using the instructions below.

### Setup Instructions (Run These Commands)

**Step 1:** Check if setup is needed:
```bash
node -e "const p=require('path'),f=require('fs'),d=process.env.CLAUDE_CONFIG_DIR||p.join(require('os').homedir(),'.claude');console.log(f.existsSync(p.join(d,'hud','omc-hud.mjs'))?'EXISTS':'MISSING')"
```

**Step 2:** Verify the plugin is installed:
```bash
node -e "const p=require('path'),f=require('fs'),d=process.env.CLAUDE_CONFIG_DIR||p.join(require('os').homedir(),'.claude'),b=p.join(d,'plugins','cache','omc','oh-my-claudecode');try{const v=f.readdirSync(b).filter(x=>/^\d/.test(x)).sort((a,c)=>a.localeCompare(c,void 0,{numeric:true}));if(v.length===0){console.log('Plugin not installed - run: /plugin install oh-my-claudecode');process.exit()}const l=v[v.length-1],h=p.join(b,l,'dist','hud','index.js');console.log('Version:',l);console.log(f.existsSync(h)?'READY':'NOT_FOUND - try reinstalling: /plugin install oh-my-claudecode')}catch{console.log('Plugin not installed - run: /plugin install oh-my-claudecode')}"
```

**Step 3:** If omc-hud.mjs is MISSING or argument is `setup`, install the HUD wrapper and its dependency from the canonical template:

```bash
HUD_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/hud"
mkdir -p "$HUD_DIR/lib"
cp "${CLAUDE_PLUGIN_ROOT}/scripts/lib/hud-wrapper-template.txt" "$HUD_DIR/omc-hud.mjs"
cp "${CLAUDE_PLUGIN_ROOT}/scripts/lib/config-dir.mjs" "$HUD_DIR/lib/config-dir.mjs"
```

**IMPORTANT:** Always copy from the canonical template at `scripts/lib/hud-wrapper-template.txt`. Do NOT write the wrapper content inline — the template is the single source of truth and is guarded by drift tests (`src/__tests__/hud-wrapper-template-sync.test.ts`, `src/__tests__/paths-consistency.test.ts`).

**Step 4:** Make it executable (Unix only, skip on Windows):
```bash
node -e "if(process.platform==='win32'){console.log('Skipped (Windows)')}else{require('fs').chmodSync(require('path').join(process.env.CLAUDE_CONFIG_DIR||require('path').join(require('os').homedir(),'.claude'),'hud','omc-hud.mjs'),0o755);console.log('Done')}"
```

**Step 5:** Update settings.json to use the HUD:

Read `${CLAUDE_CONFIG_DIR:-~/.claude}/settings.json`, then update/add the `statusLine` field.

**IMPORTANT:** Do not use `~` in the command. On Unix, use `$HOME` to keep the path portable across machines. On Windows, use an absolute path because Windows does not expand `~` in shell commands.

If you are on Windows, first determine the correct path:
```bash
node -e "const p=require('path').join(require('os').homedir(),'.claude','hud','omc-hud.mjs').split(require('path').sep).join('/');console.log(JSON.stringify(p))"
```

**IMPORTANT:** The command path MUST use forward slashes on all platforms. Claude Code executes statusLine commands via bash, which interprets backslashes as escape characters and breaks the path.

Then set the `statusLine` field. On Unix it should stay portable and look like:
```json
{
  "statusLine": {
    "type": "command",
    "command": "node ${CLAUDE_CONFIG_DIR:-$HOME/.claude}/hud/omc-hud.mjs"
  }
}
```

On Windows the path uses forward slashes (not backslashes):
