---
name: ultraqa
description: QA cycling workflow - test, verify, fix, repeat until goal met
---


# UltraQA Skill

[ULTRAQA ACTIVATED - AUTONOMOUS QA CYCLING]

## Overview

You are now in **ULTRAQA** mode - an autonomous QA cycling workflow that runs until your quality goal is met.

**Cycle**: qa-tester → architect verification → fix → repeat

## Goal Parsing

Parse the goal from arguments. Supported formats:

| Invocation | Goal Type | What to Check |
|------------|-----------|---------------|
| `/oh-my-claudecode:ultraqa --tests` | tests | All test suites pass |
| `/oh-my-claudecode:ultraqa --build` | build | Build succeeds with exit 0 |
| `/oh-my-claudecode:ultraqa --lint` | lint | No lint errors |
| `/oh-my-claudecode:ultraqa --typecheck` | typecheck | No TypeScript errors |
| `/oh-my-claudecode:ultraqa --custom "pattern"` | custom | Custom success pattern in output |

If no structured goal provided, interpret the argument as a custom goal.

## Cycle Workflow

### Cycle N (Max 5)

1. **RUN QA**: Execute verification based on goal type
   - `--tests`: Run the project's test command
   - `--build`: Run the project's build command
   - `--lint`: Run the project's lint command
   - `--typecheck`: Run the project's type check command
   - `--custom`: Run appropriate command and check for pattern
   - `--interactive`: Use qa-tester for interactive CLI/service testing:
     ```
     Task(subagent_type="oh-my-claudecode:qa-tester", model="sonnet", prompt="TEST:
     Goal: [describe what to verify]
     Service: [how to start]
     Test cases: [specific scenarios to verify]")
     ```

2. **CHECK RESULT**: Did the goal pass?
   - **YES** → Exit with success message
   - **NO** → Continue to step 3

3. **ARCHITECT DIAGNOSIS**: Spawn architect to analyze failure
   ```
   Task(subagent_type="oh-my-claudecode:architect", model="opus", prompt="DIAGNOSE FAILURE:
   Goal: [goal type]
   Output: [test/build output]
   Provide root cause and specific fix recommendations.")
   ```

4. **FIX ISSUES**: Apply architect's recommendations
   ```
   Task(subagent_type="oh-my-claudecode:executor", model="sonnet", prompt="FIX:
   Issue: [architect diagnosis]
   Files: [affected files]
   Apply the fix precisely as recommended.")
   ```

5. **REPEAT**: Go back to step 1

## Exit Conditions

| Condition | Action |
|-----------|--------|
| **Goal Met** | Exit with success: "ULTRAQA COMPLETE: Goal met after N cycles" |
| **Cycle 5 Reached** | Exit with diagnosis: "ULTRAQA STOPPED: Max cycles. Diagnosis: ..." |
| **Same Failure 3x** | Exit early: "ULTRAQA STOPPED: Same failure detected 3 times. Root cause: ..." |
| **Environment Error** | Exit: "ULTRAQA ERROR: [tmux/port/dependency issue]" |

## Observability

Output progress each cycle:
```
[ULTRAQA Cycle 1/5] Running tests...
[ULTRAQA Cycle 1/5] FAILED - 3 tests failing
```

