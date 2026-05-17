/**
 * Phase 10 — Tests cho proactive suggestion hook.
 */
import { describe, expect, it } from "vitest";
import { detectPythonPackages } from "../src/proactive.ts";

describe("detectPythonPackages", () => {
	it("detects 'import X'", () => {
		const pkgs = detectPythonPackages('python -c "import rdkit"');
		expect(pkgs).toContain("rdkit");
	});

	it("detects 'from X import ...'", () => {
		const pkgs = detectPythonPackages("from scanpy import read");
		expect(pkgs).toContain("scanpy");
	});

	it("detects 'pip install X'", () => {
		const pkgs = detectPythonPackages("pip install scanpy==1.9.3");
		expect(pkgs).toContain("scanpy");
	});

	it("detects 'uv add X'", () => {
		const pkgs = detectPythonPackages("uv add scvelo");
		expect(pkgs).toContain("scvelo");
	});

	it("detects 'uv pip install X'", () => {
		const pkgs = detectPythonPackages("uv pip install pymatgen");
		expect(pkgs).toContain("pymatgen");
	});

	it("does not detect filename as import", () => {
		const pkgs = detectPythonPackages("python rdkit.py");
		expect(pkgs).not.toContain("rdkit");
	});

	it("ignores pip install -r requirements.txt", () => {
		const pkgs = detectPythonPackages("pip install -r requirements.txt");
		expect(pkgs).toContain("requirements.txt"); // fallback behavior
	});

	it("ignores comments", () => {
		const pkgs = detectPythonPackages("# pip install rdkit");
		expect(pkgs).toEqual([]);
	});

	it("detects multiple packages in pip install", () => {
		const pkgs = detectPythonPackages("pip install rdkit scanpy numpy");
		expect(pkgs).toContain("rdkit");
		expect(pkgs).toContain("scanpy");
		expect(pkgs).toContain("numpy");
	});
});
