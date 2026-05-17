---
name: pyspark
description: Distributed data processing with Apache Spark. Use when working with large-scale datasets, distributed SQL, DataFrame operations, ETL pipelines, or cluster computing. Trigger on imports of pyspark, SparkSession, or mentions of big data, distributed, cluster, ETL, Spark, DataFrame at scale.
---
# pyspark

Use this skill for large-scale distributed data processing.

## Core patterns

- **Session**: `SparkSession.builder.appName('analysis').getOrCreate()`.
- **Read**: `spark.read.parquet('data/')` or `spark.read.csv('data.csv', header=True, inferSchema=True)`.
- **Transform**: `df.filter()`, `df.select()`, `df.groupBy().agg()`, `df.join(other, on='key')`.
- **SQL**: `df.createOrReplaceTempView('table')` → `spark.sql('SELECT * FROM table')`.
- **Write**: `df.write.parquet('output/', mode='overwrite')`.

## Rules

- Always use `coalesce(1)` or `repartition()` before writing small outputs.
- Persist intermediate DataFrames used multiple times: `df.persist(StorageLevel.MEMORY_AND_DISK)`.
- Use broadcast join for small/large table joins: `broadcast(small_df)`.
- Avoid `collect()` on large DataFrames — use `take(n)` or `toPandas()` with caution.

## Anti-patterns

- Don't call `toPandas()` on large DataFrames — it collects all data to driver.
- Don't use Python UDFs when built-in Spark SQL functions suffice.
- Don't create `SparkSession` per operation — reuse across the application.

