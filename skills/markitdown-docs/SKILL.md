---
name: markitdown-docs
description: Document conversion and format transformation. Use when converting between document formats (PDF, Word, HTML, Markdown), extracting text from binary formats, or processing structured documents. Trigger on imports of markitdown, pdfplumber, python-docx, or mentions of convert, PDF, document, format, extract text.
---
# markitdown-docs

Use this skill for document format conversion and text extraction.

## Core patterns

- **PDF text**: `markitdown.convert('file.pdf')` for markdown output.
- **Word**: `python-docx.Document('file.docx')` for structured access.
- **HTML**: `BeautifulSoup(html, 'html.parser')` for web content extraction.
- **Batch**: Loop directory with glob pattern for bulk conversion.

## Rules

- Always try `markitdown` first — it handles most formats automatically.
- For scanned PDFs, use OCR (`pytesseract`) after converting to images.
- Validate extracted text length — empty output may indicate encoding issues.

## Anti-patterns

- Don't assume PDF text extraction is 100% accurate — verify critical content.
- Don't process large document collections sequentially — use parallel workers.
- Don't ignore file encoding — always specify `encoding='utf-8'` when writing.
