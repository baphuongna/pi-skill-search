---
name: mailbox-interactive
description: Interactive waiting-task and mailbox workflow. Use when implementing or operating respond/nudge/ack/replay/supervisor-contact behavior.
---


# mailbox-interactive

Use this skill for live coordination between leader and workers. Mailbox provides an asynchronous message protocol for steer, follow-up, respond, and nudge operations.

## Mailbox Architecture

```
Worker (waiting) ← mailbox inbox ← Leader (respond)
Worker (running) ← mailbox follow-ups ← Leader (followUp)
Leader → Worker: steer, followUp, nudge (non-blocking)
Worker → Leader: supervisor contact (blocking decision)
```

### Mailbox file structure

Each run has a mailbox directory at `.crew/state/runs/<runId>/mailbox/`:
- `inbox.jsonl` — incoming messages (to worker)
- `outbox.jsonl` — sent messages (from worker)
- `steering.jsonl` — steer messages specifically

### Message structure

```typescript
interface MailboxMessage {
  id: string;
  direction: "inbox" | "outbox";
  from: string;           // taskId or "leader"
  to: string;             // taskId or "leader"
  body: string;           // message text
  status: "pending" | "delivered" | "acknowledged" | "rejected";
  priority: "low" | "normal" | "high";
  sentAt: string;         // ISO timestamp
  deliveredAt?: string;
  data?: Record<string, unknown>;  // source, correlation, etc.
}
```

## Core Operations

### 1. respond — Leader responds to waiting worker

```typescript
// Respond writes to inbox and transitions task back to running
async function respond(runId: string, taskId: string, body: string, priority = "normal") {
  // 1. Write inbox message
  const message = appendInboxMessage(manifest, { taskId, body, priority });

  // 2. Re-read state inside lock
  const { tasks } = loadRunManifestById(cwd, runId);
  const task = tasks.find(t => t.id === taskId);

  // 3. Verify task is waiting
  if (task.status !== "waiting") {
    throw new Error(`Cannot respond to non-waiting task: ${task.status}`);
  }

  // 4. Transition task back to running
  const updated = { ...task, status: "running", waitingSince: undefined };
  saveRunTasks(manifest, [updated]);

  // 5. Emit event
  appendEvent(eventsPath, { type: "task.responded", taskId, message: body });

  return message;
}
```

### 2. steer — Live agent steering (non-blocking)

```typescript
// Steer sends a message to a running live agent
async function steerLiveAgent(agentId: string, message: string) {
  const handle = getLiveAgent(agentId);
  if (!handle) throw new Error(`Live agent '${agentId}' not found`);

  // If session.steer is available, deliver immediately
  if (typeof handle.session.steer === "function") {
    await handle.session.steer(message);
    handle.updatedAt = new Date().toISOString();
