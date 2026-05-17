---
name: rdflib
description: Knowledge graph and semantic web data processing with RDF. Use when working with SPARQL queries, ontologies, linked data, triple stores, or semantic data integration. Trigger on imports of rdflib, or mentions of RDF, OWL, SPARQL, ontology, knowledge graph, triple, semantic web.
---
# rdflib

Use this skill for knowledge graph and RDF data processing.

## Core patterns

- **Load**: `g = Graph(); g.parse('data.ttl', format='turtle')`.
- **SPARQL**: `g.query('SELECT ?s WHERE { ?s a ex:Protein }')` for structured queries.
- **Create**: `g.add((subject, predicate, object))` with `URIRef` and `Literal`.
- **Serialize**: `g.serialize('output.ttl', format='turtle')`.
- **Namespaces**: `Namespace('http://example.org/')` for clean URIs.

## Rules

- Always declare namespaces with `g.bind('prefix', namespace)` for readable output.
- Use `g.value(subject, predicate)` for single-value lookups instead of SPARQL.
- Close graphs when done: `g.close()` for store-backed graphs.

## Anti-patterns

- Don't use string concatenation for URIs — use `Namespace` to ensure consistency.
- Don't load large RDF files into memory — use `g.parse()` with streaming.
- Don't write raw SPARQL without testing in a SPARQL playground first.

