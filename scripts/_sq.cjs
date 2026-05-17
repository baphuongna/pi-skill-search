const { tokenize } = require("./src/text.ts");
const { expandQuery } = require("./src/synonyms.ts");
const fs = require("fs");
const p = require("path");
const dirs = fs.readdirSync("skills").filter(f => fs.statSync(p.join("skills", f)).isDirectory());
const skills = [];
for (const d of dirs.sort()) {
	const f = p.join("skills", d, "SKILL.md");
	const c = fs.readFileSync(f, "utf8");
	const fm = c.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!fm) continue;
	let name = "";
	let desc = "";
	for (const line of fm[1].split(/\r?\n/)) {
		const nm = line.match(/^name:\s*(.+)$/); if (nm) name = nm[1].trim();
		const dm = line.match(/^description:\s*(.+)$/); if (dm) desc = dm[1].trim();
	}
	skills.push({ name, desc });
}
function ss(query, limit = 5) {
	const tokens = [...expandQuery(query)];
	const results = [];
	for (const s of skills) {
		let score = 0;
		const text = (s.name + " " + s.desc).toLowerCase();
		for (const t of tokens) {
			if (s.name.toLowerCase().includes(t)) score += 20;
			if (text.includes(t)) score += 1;
		}
		if (score > 0) results.push({ name: s.name, score });
	}
	results.sort((a, b) => b.score - a.score);
	return results.slice(0, limit);
}
const queries = [
	"single cell RNA analysis",
	"lab automation robot",
	"chemical structure SMILES",
	"parallel agent delegation",
	"VETC payment integration",
	"molecular docking",
	"how to work with DNA sequences",
	"build a neural network",
	"convert PDF to markdown",
];
for (const q of queries) {
	const r = ss(q);
	console.log(q + " => " + r.map(x => `${x.name}(${x.score})`).join(", "));
}
