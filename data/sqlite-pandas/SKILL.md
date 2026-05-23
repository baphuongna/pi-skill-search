---
name: sqlite-pandas
description: Relational database querying and tabular data manipulation. Use when reading/writing SQLite databases with pandas, performing SQL joins, aggregations, window functions, or converting between DataFrames and SQL tables. Trigger on imports of sqlite3, pandas.read_sql, or mentions of database query, SQL, table join, data aggregation.
---
# sqlite-pandas

Use this skill for database operations with pandas DataFrames.

## Core patterns

- **Connect**: `conn = sqlite3.connect('data.db')`.
- **Read**: `pd.read_sql_query("SELECT * FROM table WHERE col > ?", conn, params=[val])`.
- **Write**: `df.to_sql('table', conn, if_exists='append', index=False)`.
- **Join**: SQL `JOIN` for multi-table queries; `pd.merge()` for in-memory joins.
- **Aggregation**: SQL `GROUP BY` + `HAVING` for server-side; `df.groupby().agg()` for client-side.

## Rules

- Always use parameterized queries (`?` placeholders) — never f-string SQL.
- Close connections: use `with sqlite3.connect() as conn:` or `conn.close()`.
- For large tables, use `chunksize` parameter in `pd.read_sql_query()`.
- Index columns used in WHERE/JOIN: `CREATE INDEX idx_col ON table(col)`.

## Anti-patterns

- Don't load entire database into memory — filter in SQL first.
- Don't use `pd.read_sql_query()` without `params` for user input — SQL injection risk.
- Don't mix datetime formats — SQLite stores dates as text; parse with `parse_dates` parameter.


