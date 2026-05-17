---
name: simpy
description: Process-based discrete-event simulation framework in Python. Use this skill when building simulations of systems with processes, queues, resources, and time-based events such as manufacturing systems, service operations, network traffic, logistics, or any system where entities interact with shared resources over time.
---

# SimPy - Discrete-Event Simulation

## Overview

SimPy is a process-based discrete-event simulation framework based on standard Python. Use SimPy to model systems where entities (customers, vehicles, packets, etc.) interact with each other and compete for shared resources (servers, machines, bandwidth, etc.) over time.

**Core capabilities:**
- Process modeling using Python generator functions
- Shared resource management (servers, containers, stores)
- Event-driven scheduling and synchronization
- Real-time simulations synchronized with wall-clock time
- Comprehensive monitoring and data collection

## When to Use This Skill

Use the SimPy skill when:

1. **Modeling discrete-event systems** - Systems where events occur at irregular intervals
2. **Resource contention** - Entities compete for limited resources (servers, machines, staff)
3. **Queue analysis** - Studying waiting lines, service times, and throughput
4. **Process optimization** - Analyzing manufacturing, logistics, or service processes
5. **Network simulation** - Packet routing, bandwidth allocation, latency analysis
6. **Capacity planning** - Determining optimal resource levels for desired performance
7. **System validation** - Testing system behavior before implementation

**Not suitable for:**
- Continuous simulations with fixed time steps (consider SciPy ODE solvers)
- Independent processes without resource sharing
- Pure mathematical optimization (consider SciPy optimize)

## Quick Start

### Basic Simulation Structure

```python
import simpy

def process(env, name):
    """A simple process that waits and prints."""
    print(f'{name} starting at {env.now}')
    yield env.timeout(5)
    print(f'{name} finishing at {env.now}')

# Create environment
env = simpy.Environment()

# Start processes
env.process(process(env, 'Process 1'))
env.process(process(env, 'Process 2'))

# Run simulation
env.run(until=10)
```

### Resource Usage Pattern

```python
import simpy

def customer(env, name, resource):
    """Customer requests resource, uses it, then releases."""
    with resource.request() as req:
        yield req  # Wait for resource
        print(f'{name} got resource at {env.now}')
        yield env.timeout(3)  # Use resource
        print(f'{name} released resource at {env.now}')

env = simpy.Environment()
server = simpy.Resource(env, capacity=1)

## Core Concepts

### 1. Environment

The simulation environment manages time and schedules events.

```python
import simpy

# Standard environment (runs as fast as possible)
env = simpy.Environment(initial_time=0)

# Real-time environment (synchronized with wall-clock)
import simpy.rt
env_rt = simpy.rt.RealtimeEnvironment(factor=1.0)

# Run simulation
env.run(until=100)  # Run until time 100
env.run()  # Run until no events remain
```

### 2. Processes

Processes are defined using Python generator functions (functions with `yield` statements).

```python
def my_process(env, param1, param2):
    """Process that yields events to pause execution."""
    print(f'Starting at {env.now}')

    # Wait for time to pass
    yield env.timeout(5)

    print(f'Resumed at {env.now}')

    # Wait for another event

# Start the process
env.process(my_process(env, 'value1', 'value2'))
```

<!-- condensed from source -->

