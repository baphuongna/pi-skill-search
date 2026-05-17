---
name: vetc-cicd
description: PROACTIVELY activate khi cần setup CI/CD, tạo build pipeline, thêm GitHub Actions, hoặc troubleshoot build/deploy. Maven/Gradle/npm build commands, coverage, Docker.
---

# VETC CI/CD — Build, Test, Deploy

Commands và templates cho CI/CD workflows trong VETC project.

## When to Activate

- Cần build/test/deploy commands
- Tạo hoặc update GitHub Actions workflow
- Chạy coverage report
- Debug CI pipeline failure
- Setup Docker build

## Do NOT Activate When

- Viết business logic / application code (dùng `vetc-java-patterns` hoặc `vetc-frontend-patterns`)
- Chỉ cần code review (dùng reviewer agents)
- CI/CD đã configured và đang hoạt động ổn định, không cần thay đổi

## Build Commands

### Maven (Backend)

```bash
# Compile only (fast check)
mvn clean compile -q

# Compile + tests
mvn clean test -q

# Full package (jar/war)
mvn clean package -DskipTests -q

# Multi-module — specific module
mvn clean compile -pl wallet-service -am -q

# With profile
mvn clean package -Pprod -DskipTests -q

# Check dependencies
mvn dependency:tree | grep <dependency>
```

### npm (Frontend)

```bash
# Type check
npx tsc --noEmit

# Build production
npm run build

# Test with coverage
npm test -- --coverage

# Lint
npx eslint src/ --ext .ts,.tsx

# Bundle analysis
npx vite-bundle-visualizer
```

## GitHub Actions Templates

### Backend CI

```yaml
name: Backend CI
on:
  push:
    paths: ['backend/**']
  pull_request:
    paths: ['backend/**']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4

### Frontend CI

```yaml
name: Frontend CI
on:
  push:
    paths: ['frontend/**']
  pull_request:
    paths: ['frontend/**']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

## Coverage Commands

```bash
# Backend — JaCoCo report
mvn verify -pl <module> -q
open <module>/target/site/jacoco/index.html

# Backend — check threshold
mvn verify -Djacoco.threshold=0.80

# Frontend — Jest coverage
npm test -- --coverage --watchAll=false
```

