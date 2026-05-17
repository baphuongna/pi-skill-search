---
name: child-pi-spawning
description: Child Pi worker spawning, lifecycle callbacks, and failure modes. Use when debugging worker crashes, scaffold mode behavior, or spawn-time failures.
---


# child-pi-spawning

Child Pi workers are subprocesses spawned by `task-runner.ts` via `runChildPi()` in `child-pi.ts`. Understanding the spawn flow, lifecycle events, and failure modes is essential for debugging worker crashes and "worker blinks" issues.

## Spawn Flow

```
task-runner.ts (runTeamTask)
  → runChildPi({ cwd, task, agent, model, skillPaths, signal, onLifecycleEvent })
    → child-pi.ts (runChildPi main function)
      → buildPiWorkerArgs() → getPiSpawnCommand() → spawn(command, args, options)
        → ChildProcess spawned
        → activeChildProcesses.set(pid, child)
        → input.onLifecycleEvent({ type: "spawned", pid, ts })
        → stdout.on("data") → ChildPiLineObserver
        → stderr.on("data")
        → child.on("error") → onLifecycleEvent("spawn_error")
        → child.on("exit") → onLifecycleEvent("exit")
        → child.on("close") → onLifecycleEvent("close"), settle(result)
```

### Key components

- **ChildPiLineObserver**: Parses JSON events and stdout lines from child Pi's output stream
- **Response timeout**: 5-minute timer resets on every stdout/stderr chunk; on timeout → SIGTERM
- **Final drain**: After last assistant event, waits `finalDrainMs` (default 2s) then SIGTERM
- **Hard kill**: After `hardKillMs` (default 2s) from SIGTERM, SIGKILL
- **Active process tracking**: `activeChildProcesses` Map for global cleanup

## Lifecycle Events

`ChildPiLifecycleEvent` interface — emitted via `onLifecycleEvent` callback:

```typescript
interface ChildPiLifecycleEvent {
  type: "spawned" | "spawn_error" | "response_timeout" | "final_drain" | "hard_kill" | "exit" | "close";
  pid?: number;
  exitCode?: number | null;
  error?: string;
  ts: string;
}
```

### Event sequence for normal completion:

```
1. spawned      pid=12345            ← child.pid assigned
2. [stdout events: message, tool_execution_start, tool_execution_end, message_end...]
3. final_drain  pid=12345            ← last assistant event received, SIGTERM sent
4. exit         exitCode=0           ← process exited
5. close        exitCode=0           ← stdio fully closed
```

### Event sequence for crash:

```
1. spawned      pid=12345
2. spawn_error   error="..."         ← OR →
3. exit         exitCode=1
4. close        exitCode=1
```

### Event sequence for timeout:

```
1. spawned      pid=12345
2. [no stdout for 5 min]
3. response_timeout error="No output for 300000ms"
4. final_drain  pid=12345
5. hard_kill    pid=12345            ← SIGKILL after hardKillMs
6. exit         exitCode=null
7. close        exitCode=null
```

## onLifecycleEvent Callback Pattern

The callback bridges child-pi events → events.jsonl:

```typescript
