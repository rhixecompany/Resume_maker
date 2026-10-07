# Hermes Log Analysis and Triage

Generated: 2026-10-07T06:16:16.287831+00:00
Logs directory: `<HERMES_HOME>/logs`
Files: 26 | Lines: 126279 | Errors: 2500

## Error categories

- `other`: 1817
- `session`: 310
- `provider`: 256
- `rate_limit`: 70
- `network`: 47

## Top sanitized error signatures

- 828× `pydantic_core._pydantic_core.ValidationError: 1 validation error for union[JSONRPCRequest,JSONRPCNotification,JSONRPCResponse,JSONRPCError]`
- 46× `openai.APIConnectionError: Connection error.`
- 36× `openai.RateLimitError: Error code: 429 - {'error': {'message': 'Rate limit exceeded: free-models-per-day. Add 5 credits to unlock 1000 free model requests per day', 'code': 429, 'metadata': {'headers': {'X-RateLimit-Limit': '50', 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '1790467200000'}, '`
- 24× `RuntimeError: internal error: APIError: Upstream error from Nvidia: Service temporarily overloaded`
- 24× `openai.APIError: Upstream error from Nvidia: Service temporarily overloaded`
- 14× `agent.gemini_native_adapter.GeminiAPIError: Gemini HTTP 429 (RESOURCE_EXHAUSTED): You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https`
- 6× `openai.RateLimitError: Error code: 429 - {'error': {'message': 'Rate limit exceeded: free-models-per-day. Add 5 credits to unlock 1000 free model requests per day', 'code': 429, 'metadata': {'headers': {'X-RateLimit-Limit': '50', 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '1791417600000'}, '`
- 6× `2026-10-06 21:11:44,895 ERROR mcp.client.stdio: Failed to parse JSONRPC message from server`
- 6× `openai.RateLimitError: Error code: 429 - {'status': 429, 'message': "The requested model is temporarily at capacity upstream. This is not your API key's rate limit — please retry shortly."}`
- 6× `openai.RateLimitError: Error code: 429 - {'error': {'message': 'Rate limit exceeded: free-models-per-day. Add 10 credits to unlock 1000 free model requests per day', 'code': 429, 'metadata': {'headers': {'X-RateLimit-Limit': '50', 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '1790467200000'}, `
- 6× `✗ node: staged entry failed verification: <HOME> --version exited 127: <HOME>: error while loading shared libraries: libatomic.so.1: cannot open shared object file: No such file or directory — retry, or run `hermes pm doctor``
- 4× `2026-09-27 04:18:56,711 ERROR mcp.client.stdio: Failed to parse JSONRPC message from server`
- 4× `2026-09-27 04:19:01,700 ERROR mcp.client.stdio: Failed to parse JSONRPC message from server`
- 4× `2026-09-27 04:20:04,130 ERROR mcp.client.stdio: Failed to parse JSONRPC message from server`
- 4× `2026-09-27 04:20:05,956 ERROR mcp.client.stdio: Failed to parse JSONRPC message from server`
- 4× `2026-09-27 04:20:07,504 ERROR mcp.client.stdio: Failed to parse JSONRPC message from server`
- 4× `2026-09-27 04:21:08,200 ERROR mcp.client.stdio: Failed to parse JSONRPC message from server`
- 4× `2026-09-27 04:21:08,204 ERROR mcp.client.stdio: Failed to parse JSONRPC message from server`
- 4× `2026-09-27 04:33:54,832 ERROR mcp.client.stdio: Failed to parse JSONRPC message from server`
- 4× `2026-09-27 04:33:54,856 ERROR mcp.client.stdio: Failed to parse JSONRPC message from server`

## Per-file error counts

| File | Lines | Errors | Top all-line category |
|---|---:|---:|---|
| errors.log.1 | 21366 | 1218 | other |
| agent.log.1 | 38239 | 826 | plugin |
| agent.log.2 | 34588 | 382 | other |
| agent.log | 10401 | 16 | plugin |
| gateway-shutdown-diag.log | 503 | 13 | other |
| mcp-stderr.log | 1285 | 10 | other |
| tui_gateway_crash.log | 17011 | 9 | other |
| errors.log | 369 | 6 | plugin |
| install.log | 594 | 6 | other |
| update.log | 601 | 6 | other |
| action-skills-install-skills-sh-jsmastery-pro-skills-architect-e1af07d0.log | 118 | 4 | other |
| action-skills-install-official-autonomous-ai-agents-antigravity-cli-c50527af.log | 18 | 1 | other |
| action-skills-install-skills-sh-blockmatic-basilic-skills-w-coderabbit-8cfcf7e0.log | 9 | 1 | other |
| action-skills-install-skills-sh-coderabbitai-skills-autofix-077fbfc4.log | 9 | 1 | other |
| action-skills-install-skills-sh-jsmastery-pro-skills-audit-b1caddc7.log | 9 | 1 | other |
| action-skills-install-official-autonomous-ai-agents-agent-merge-confli-49bb2ca5.log | 15 | 0 | other |
| action-skills-install-official-software-development-ast-grep-6c10514d.log | 71 | 0 | other |
| action-skills-install-skills-sh-coderabbitai-skills-code-review-bbf864fb.log | 21 | 0 | other |
| action-skills-install-skills-sh-fallow-rs-fallow-skills-fallow-16c65f8b.log | 240 | 0 | other |
| action-skills-install-skills-sh-fallow-rs-fallow-skills-fallow-review-29c2daee.log | 23 | 0 | other |
| action-skills-update.log | 4 | 0 | other |
| gateway-exit-diag.log | 37 | 0 | other |
| gateway-restart.log | 6 | 0 | other |
| gateway.log | 515 | 0 | other |
| gateway_faulthandler.log | 0 | 0 | other |
| gui.log | 227 | 0 | plugin |

## Triage notes

- Samples are sanitized before this report is written.
- Error categories count only ERROR/CRITICAL lines from this single-pass snapshot.
- High-frequency signatures are candidates for investigation, not proof of an active fault.
