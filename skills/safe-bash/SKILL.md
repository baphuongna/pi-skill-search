---
name: safe-bash
description: Safe shell-command workflow. Use whenever a task may execute shell commands, especially to prefer read-only commands and avoid destructive actions without confirmation.
---


# safe-bash

Use this skill whenever a task may execute shell commands. This skill covers cross-platform shell safety, destructive action confirmation, and Windows-specific patterns.

## Classification

Every shell command is either **read-only** or **mutating**. Always report which it is.

### Read-only commands (safe)
```bash
pwd              # print working directory
ls -la           # list files
find . -name "*.ts" | head -20        # search without writing
rg "pattern" --type ts | head -20     # ripgrep without write
git status       # inspect state
git log --oneline -5  # recent commits
git diff --staged    # staged changes
npm view <pkg>   # query registry (no install)
npx tsc --noEmit  # typecheck (no write)
node -e "console.log(process.version)"  # inspect version
```

### Mutating commands (require confirmation)
```bash
npm install      # changes node_modules
git commit       # creates new commit
git push         # publishes to remote
rm -rf <path>    # DESTRUCTIVE
git reset --hard # rewrites history
npm publish      # publishes to registry
```

## Cross-Platform Considerations

### Windows vs Unix paths

```typescript
// ❌ Never hardcode paths with forward slashes on Windows
const path = "D:/project/src/file.ts";

// ✅ Use path.join() or Node's path module
import * as path from "path";
const filePath = path.join(cwd, "src", "file.ts");

// ✅ Or use forward slashes that work on both
const filePath = "src/file.ts"; // relative paths work on both
```

### argv vs cmd /c

```typescript
// ✅ Preferred on Windows: argv-based execution (no shell)
import { spawn } from "child_process";
spawn("node", ["--version"], { stdio: "pipe" });

// ✅ If shell needed: use cmd /c explicitly
spawn("cmd", ["/c", "dir /b"], { stdio: "pipe" });

// ❌ Don't use cmd /c with complex commands as single string
spawn("cmd", ["/c", "node --version && npm test"], { stdio: "pipe" });
```

### Package manager detection

```typescript
// Detect npm vs pnpm vs yarn
function detectPackageManager(cwd: string): "npm" | "pnpm" | "yarn" | "unknown" {
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  return "npm";
}
```

## Heredoc and Quoting Gotchas

### Quoting variables in commands

```bash
# ❌ Unsafe: variable expansion without quoting
