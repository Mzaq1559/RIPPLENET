---
name: api-contracts
description: Design or modify REST/GraphQL API contracts and coordinate frontend/backend integration. Use when adding endpoints, changing schemas, or connecting services.
---

# API Contract Workflow

1. Inspect existing routes, schemas, auth middleware, error conventions, and API docs.
2. Define request, response, status codes, validation, pagination, and error shape before implementation.
3. Keep contracts explicit; use OpenAPI or shared types when the project already supports them.
4. Validate authentication and authorization separately from input validation.
5. Make frontend loading, empty, success, and failure states match the contract.
6. Add tests for valid, invalid, unauthorized, missing, and boundary inputs.
7. Update API documentation and example environment variables.
8. Notify parallel agents before changing a shared contract.
