# Agentic AI — Evaluation and Testing in 2026

## Overview

Evaluating agentic systems is fundamentally harder than evaluating single-turn LLM responses.
The unit of evaluation is no longer a single (prompt, response) pair but an entire trajectory —
a sequence of reasoning steps, tool calls, and intermediate states that culminate in a final
output. Both the trajectory and the output must be assessed.

## What Makes Agent Evaluation Difficult

- **Non-determinism**: The same input can produce different valid trajectories across runs.
- **Long horizons**: Errors early in a multi-step trace may only manifest at the end.
- **Partial credit**: An agent that fails on step 8 of 10 did something right for 7 steps.
- **Tool dependence**: Correctness depends on external tools, not just the model.
- **Latency and cost**: Running full agent traces for evaluation is expensive.
- **No ground truth for trajectories**: There are often many valid paths to a correct answer.

---

## Evaluation Dimensions

### 1. Task Success Rate

The most important metric: did the agent achieve the stated goal?

- **Binary**: pass/fail — useful for tasks with objectively verifiable outcomes
  (e.g., "Does the generated code pass the test suite?")
- **Graded**: scored 0–1 — for tasks with degrees of correctness
  (e.g., "How complete is the generated research report?")

### 2. Trajectory Efficiency

How many steps, tool calls, and tokens did the agent consume to reach a correct answer?
A correct answer that required 20 tool calls when 5 sufficed indicates poor planning.

Metrics:
- `steps_to_completion`
- `tool_calls_per_task`
- `total_tokens_used`
- `redundant_tool_calls` (calling the same tool with the same args multiple times)

### 3. Tool Use Accuracy

- **Correct tool selection rate**: Did the agent pick the right tool for each step?
- **Correct argument rate**: Were the arguments to each tool call valid and appropriate?
- **Hallucinated tool calls**: Did the agent attempt to call tools that do not exist?

### 4. Faithfulness (for RAG agents)

For agents that retrieve and cite information:
- Are all claims in the final answer supported by retrieved context?
- Are citations accurate (do they point to the actual source of the claim)?

### 5. Safety and Policy Compliance

- Did the agent attempt any disallowed actions?
- Did it expose sensitive data (PII, credentials) in tool arguments or outputs?
- Did it respect human-in-the-loop interrupt points?

---

## Evaluation Strategies

### End-to-End Task Evaluation

Define a benchmark of tasks with known correct answers. Run the agent on each task,
then check the output against the expected answer using:

- **Exact match**: for structured outputs (JSON, SQL, code that passes tests)
- **LLM-as-judge**: for open-ended outputs — a judge model scores the answer
- **Human review**: ground truth for high-stakes tasks; expensive but necessary periodically

```
Task: "What were total Q1 2026 sales for the EMEA region?"
Expected: A number extracted from the sales database
Agent output: "$4.2M"  →  verify against DB ground truth
```

### Trajectory Evaluation

Record the full agent trace (each thought, tool call, tool result). Evaluate:

- Were tool calls in a logical order?
- Were there unnecessary steps?
- Did the agent recover gracefully from tool errors?

Tools like LangSmith, Phoenix (Arize), and Braintrust support trace-level visualization
and scoring in 2026.

### Unit Testing Agent Components

Test individual components in isolation before evaluating the full agent:

| Component | What to test |
|---|---|
| Tool definitions | Correct schema, description quality, edge case handling |
| Planner | Given a goal, does the plan make sense? |
| Tool executor | Given a tool call, is the result correct? |
| Output formatter | Given context, is the final answer well-formed? |
| Guardrails | Do classifiers correctly flag disallowed inputs/outputs? |

### Regression Testing

Every time the underlying model, system prompt, or tool set changes, run the full task
benchmark to detect regressions. Store trace snapshots for diffing — a new model version
might get the right answer via a worse trajectory.

### Adversarial / Red-Team Testing

Proactively test failure modes:
- **Prompt injection**: malicious content in tool results that tries to hijack the agent
- **Jailbreaks**: user inputs designed to override the system prompt
- **Infinite loops**: tasks designed to keep the agent searching without converging
- **Hallucinated tool calls**: ambiguous tasks that tempt the agent to invent tools
- **Scope creep**: tasks where the agent might take broader actions than authorized

---

## LLM-as-Judge Pattern

For qualitative evaluation at scale, a separate "judge" LLM scores agent outputs.
The judge receives: the original task, the agent's final answer, and (optionally) the
expected answer or retrieved context. It returns a score and a short rationale.

**Judge prompt structure:**
```
You are an impartial evaluator. Score the agent's response on a scale of 1–5.

Task: {task}
Agent's answer: {answer}
Expected answer (reference): {expected}

Criteria:
- Correctness: Is the factual content accurate?
- Completeness: Does it address all parts of the task?
- Conciseness: Is it free of unnecessary information?

Respond with JSON: {"score": <1-5>, "rationale": "<one sentence>"}
```

**Pitfalls:**
- Judge models exhibit positional bias (favor longer or first-listed answers)
- A judge using the same base model as the agent may share the same blind spots
- Calibrate the judge against human ratings before trusting it at scale

---

## Metrics Summary

| Metric | Formula / Method | Target |
|---|---|---|
| Task success rate | `passed / total` | > 80% for production |
| Mean steps to completion | `sum(steps) / tasks` | Minimize; benchmark against human |
| Tool precision | `correct_calls / total_calls` | > 90% |
| Hallucinated tool call rate | `invalid_calls / total_calls` | < 2% |
| Faithfulness (RAG) | LLM-judge score | > 4.0 / 5.0 |
| Guardrail trigger rate | `blocked / total` | Monitor; sudden spikes indicate attacks |
| P95 latency | 95th percentile trace duration | < SLA threshold |
| Cost per task | `total_tokens × price / tasks` | Monitor vs. budget |

---

## Evaluation Infrastructure in 2026

### Tracing

Every agent run should emit structured traces — a tree of spans, one per step. Traces
enable debugging individual runs and aggregating metrics across runs.

Recommended tools: **LangSmith**, **Arize Phoenix**, **Braintrust**, **OpenTelemetry** (for
self-hosted, vendor-neutral tracing).

### Datasets and Benchmarks

Maintain a versioned evaluation dataset alongside your agent code. A dataset entry contains:

```json
{
  "id": "task-001",
  "input": "Summarize all support tickets filed in March 2026 about login failures.",
  "expected_output_contains": ["login", "March 2026"],
  "expected_tools_used": ["query_tickets_db"],
  "max_steps": 6
}
```

### CI/CD Integration

Run a smoke-test subset of the evaluation benchmark on every PR. Run the full benchmark
on every release candidate. Gate production deployments on a minimum task success rate.

```yaml
# Example CI step
- name: Agent evaluation
  run: python eval/run_benchmark.py --subset smoke --min-pass-rate 0.85
```

### Human Review Queue

Route low-confidence agent outputs (score below threshold from automated eval) to a human
review queue. Human feedback is used to:
- Expand the evaluation dataset with new edge cases
- Fine-tune guardrail classifiers
- Identify which tools or prompts need improvement
