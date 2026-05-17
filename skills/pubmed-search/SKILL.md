---
name: pubmed-search
description: Literature search and retrieval from PubMed and biomedical databases. Use when searching scientific publications, retrieving abstracts, managing citation data, or systematic review screening. Trigger on mentions of PubMed, literature search, paper search, citation, bibliography, or systematic review.
---
# pubmed-search

Use this skill for searching and retrieving biomedical literature.

## Core patterns

- **Search**: `Entrez.esearch(db='pubmed', term='keyword', retmax=100)`.
- **Fetch**: `Entrez.efetch(db='pubmed', id=pmids, rettype='abstract', retmode='xml')`.
- **Parse**: `Medline.parse()` for structured abstract parsing.
- **Filters**: Use MeSH terms for precision: `'neoplasms'[MeSH Terms] AND 'therapy'[MeSH Subheading]`.
- **Rate limit**: Always set `Entrez.email` and `Entrez.api_key`.

## Rules

- Always set `Entrez.email` before any request — NCBI requires it.
- Use `time.sleep(0.34)` between requests (3 req/sec without API key).
- Parse XML responses with `Entrez.read()` — don't regex XML.

## Anti-patterns

- Don't fetch full articles via Entrez — use `rettype='abstract'` for abstracts.
- Don't ignore date filters — always specify date range for recent results.
- Don't assume PMIDs are unique across databases — specify `db='pubmed'`.
