#!/usr/bin/env node
/**
 * pi-skill-search install script.
 * 
 * Copies skill-search SKILL.md to ~/.pi/skills/ so Pi can discover it.
 * This is needed because Pi doesn't auto-discover skills from extension directories.
 */
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const home = process.env.HOME || os.homedir();
const skillsDir = path.join(home, ".pi", "agent", "skills");
const skillSearchDir = path.join(skillsDir, "skill-search");
const skillSearchFile = path.join(skillSearchDir, "SKILL.md");

// Find this extension's location
const extPath = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));

// Look for skill-search in data/ (original location) or skills/ (if user copied)
const possibleLocations = [
  path.join(extPath, "data", "skill-search", "SKILL.md"),
  path.join(extPath, "skills", "skill-search", "SKILL.md"),
];

let sourceFile = null;
for (const loc of possibleLocations) {
  if (fs.existsSync(loc)) {
    sourceFile = loc;
    break;
  }
}

if (!sourceFile) {
  console.log("pi-skill-search: skill-search/SKILL.md not found in extension.");
  console.log(`  Looked in: ${possibleLocations.join(", ")}`);
  process.exit(1);
}

console.log(`pi-skill-search: Found skill at ${sourceFile}`);

// Copy skill to ~/.pi/skills/
fs.mkdirSync(skillSearchDir, { recursive: true });
fs.copyFileSync(sourceFile, skillSearchFile);

console.log(`pi-skill-search: Installed skill-search to ${skillSearchFile}`);
console.log("\nReload Pi to load the new skill.");