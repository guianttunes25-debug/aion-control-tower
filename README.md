# TaskMaster

TaskMaster is the active MVP for the AI Company operation.

## Current Phase
Product-Market Fit Phase 2B: the backend focuses the revenue engine on one niche, one offer, persistent lead memory, and revenue metrics for validating the first recurring local business customer.

## Initial Structure
- `backend/`: Spring Boot API
- `frontend/`: React application
- `infra/`: local development infrastructure
- `docs/`: technical notes and decisions

## Current Constraints
- No JWT implementation yet
- No Supabase integration yet
- Automation is currently assisted and human-approved; login, passwords, captchas, publishing, sending, payments, and sensitive external actions remain manual.
- Focus on local runtime stability first

## Local Runtime

Portfolio document:

```text
docs/PORTFOLIO_AION_CONTROL_TOWER.md
```

User guide:

```text
docs/TUTORIAL_USO_AION_CONTROL_TOWER.md
```

Start PostgreSQL from the infrastructure folder:

```powershell
cd C:\AI-Company\projects\taskmaster\infra
docker compose up -d
```

Run the backend with a JDK that can compile Java 21:

```powershell
cd C:\AI-Company\projects\taskmaster\backend
$env:JAVA_HOME='C:\Program Files\Java\jdk-24'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
mvn spring-boot:run
```

Validate the health endpoint:

```powershell
curl.exe http://localhost:8080/actuator/health
```

Run the Aion Control Tower UI:

```powershell
cd C:\AI-Company\projects\taskmaster\frontend
npm install
npm run dev -- --host 127.0.0.1
```

Open the dashboard:

```text
http://localhost:5173
```

## Windows Launcher EXE

The local AION Control Tower can be started with the generated Windows launcher:

```powershell
& "C:\AI-Company\projects\taskmaster\dist\windows\AION Company\AION Company.exe"
```

The launcher starts PostgreSQL through Docker Compose when needed, checks the backend and frontend, and opens the dashboard at `http://localhost:5173`.

Regenerate the launcher after frontend/backend changes:

```powershell
cd C:\AI-Company\projects\taskmaster\tools\windows-launcher
.\build-exe.ps1
```

If the launcher folder is moved, set the project root before running it:

```powershell
$env:AION_TASKMASTER_HOME="C:\AI-Company\projects\taskmaster"
```

The frontend polls the backend through the Vite proxy at `/api`, so keep the backend running on `http://localhost:8080`.

Current Control Tower modules:

- Control Tower: system status, heartbeat, runtime metrics, PMF metrics, top leads, and live feed.
- CEO Agent: local executive chat with fast mode, auto mode, and GPT mode through Ollama.
- Browser Operator SDR: assisted freelance/job search, opportunity analysis, fit scoring, execution plan, and proposal draft.
- Browser Autopilot: permission-based browser action session, safe action plan, and human authorization gate for page work.
- Product & Content Studio: product concept, AI image prompt, marketplace copy, reels script, caption, and publishing checklist.
- Automation & Learning Center: assisted automatic execution, course/article learning memory, and human-approved local runs.
- Agent Graph: hierarchy and delegation view using React Flow with live runtime agents.
- Ops Room: 2D operator floor with visual stations for planner, lead, revenue, recovery, reply, and deploy agents.
- Approval Console: human-in-the-loop local approval gate for high-score leads and critical actions.

Validate the persistence checkpoint:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "select id, marker from system_checkpoint order by id desc limit 5;"
```

Create a task:

```powershell
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Validar dominio minimo","description":"Primeira task persistida pelo endpoint REST"}'
```

List tasks:

```powershell
curl.exe http://localhost:8080/tasks
```

Validate task persistence:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "select id, title, status, created_at, updated_at from tasks order by id desc limit 5;"
```

Complete a task:

```powershell
curl.exe -i -X PATCH http://localhost:8080/tasks/1/complete
```

Validate input errors:

```powershell
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"","description":"descricao invalida"}'
```

Validate not found errors:

```powershell
curl.exe -i -X PATCH http://localhost:8080/tasks/999999/complete
```

Validate agent runtime state:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "select id, name, type, status, last_heartbeat from agents order by id;"
```

Validate recent assignments:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "select ta.id, ta.task_id, a.name as agent_name, ta.assigned_at from task_assignments ta join agents a on a.id = ta.agent_id order by ta.id desc limit 5;"
```

Create a task for automatic agent execution:

```powershell
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Agent runtime validation","description":"Task criada para o FakeCodeAgent executar automaticamente"}'
```

Validate agent execution logs:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "select id, task_id, level, message from agent_execution_logs order by id desc limit 10;"
```

Validate runtime events:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "select id, type, task_id, message from runtime_events order by id desc limit 12;"
```

Validate runtime query endpoints:

```powershell
curl.exe http://localhost:8080/runtime/agents
curl.exe http://localhost:8080/runtime/events
curl.exe http://localhost:8080/runtime/tasks/running
curl.exe http://localhost:8080/runtime/metrics
```

Create a deterministic retry validation task:

```powershell
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Retry validation","description":"force-fail-once validar retry deterministico"}'
```

Force the retry window during local validation:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "update tasks set next_retry_at = now() where title = 'Retry validation';"
```

Inspect retry state:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "select id, title, status, retry_count, max_retries, last_failure_reason, next_retry_at from tasks order by id desc limit 10;"
```

Validate multi-agent routing:

```powershell
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Plan architecture","description":"Planejar arquitetura da API","agentType":"PLANNER"}'
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Implement API","description":"Criar endpoints REST","agentType":"CODE"}'
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Review API","description":"Revisar contrato HTTP","agentType":"REVIEW"}'
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Test API","description":"Validar build e endpoints","agentType":"TEST"}'
```

Inspect multi-agent assignments:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "select t.id, t.title, t.required_agent_type, t.status, t.retry_count, a.name from task_assignments ta join tasks t on t.id = ta.task_id join agents a on a.id = ta.agent_id order by ta.id desc limit 20;"
```

Validate concurrent dispatch:

```powershell
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Concurrent planner","description":"Planejar em paralelo","agentType":"PLANNER"}'
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Concurrent research","description":"Pesquisar em paralelo","agentType":"RESEARCH"}'
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Concurrent code","description":"Codar em paralelo","agentType":"CODE"}'
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Concurrent review","description":"Revisar em paralelo","agentType":"REVIEW"}'
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Concurrent fix","description":"Corrigir em paralelo","agentType":"FIX"}'
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Concurrent test","description":"Testar em paralelo","agentType":"TEST"}'
curl.exe -i -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Concurrent deploy","description":"Preparar deploy em paralelo","agentType":"DEPLOY"}'
```

Inspect concurrent execution timestamps:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "select t.id, t.title, t.required_agent_type, t.status, t.retry_count, a.name, t.started_at, t.completed_at from task_assignments ta join tasks t on t.id = ta.task_id join agents a on a.id = ta.agent_id where t.title like 'Concurrent%' order by t.started_at desc limit 20;"
```

Create a local growth revenue workflow:

```powershell
curl.exe -i -X POST http://localhost:8080/revenue/workflows/local-growth -H "Content-Type: application/json" -d '{"leadName":"Mercado Bom Preco","niche":"mercado local","website":"https://example.com","instagram":"@mercadobompreco","notes":"validar automacao comercial semi-autonoma para geracao de oferta e abordagem inicial"}'
```

Inspect a revenue workflow:

```powershell
curl.exe http://localhost:8080/revenue/workflows/REV-WORKFLOW-ID
```

Inspect revenue workflow tasks:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "select id, workflow_step, title, required_agent_type, status, blocked_by_task_id, retry_count from tasks where workflow_id = 'REV-WORKFLOW-ID' order by workflow_step;"
```

Inspect revenue workflow assignments:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "select t.workflow_step, t.required_agent_type, a.name, t.status, t.started_at, t.completed_at from task_assignments ta join tasks t on t.id = ta.task_id join agents a on a.id = ta.agent_id where t.workflow_id = 'REV-WORKFLOW-ID' order by t.workflow_step;"
```

Inspect persistent revenue memory:

```powershell
curl.exe http://localhost:8080/revenue/workflows/memory/leads
```

Inspect PMF metrics:

```powershell
curl.exe http://localhost:8080/revenue/workflows/metrics/pmf
```

Inspect revenue memory in PostgreSQL:

```powershell
docker exec taskmaster-postgres psql -U taskmaster_app -d taskmaster -c "select lead_name, niche, product_offer, target_monthly_price, meetings_booked, offers_accepted, monthly_recurring_revenue from revenue_lead_memory order by updated_at desc limit 10;"
```

## Roadmap
- Phase 1A: Multi-Agent Orchestration with Planner, Research, Code, Review, Fix, Test, and Deploy agents.
- Phase 1B: Concurrent Runtime Dispatch with batch pull, capability queues, agent pools, and virtual-thread execution.
- Phase 2A: Revenue Operations Runtime for lead research, opportunity scoring, offer generation, outreach draft, reply analysis, and human approval.
- Phase 2B: Product-Market Fit validation for one niche, one offer, one recurring customer, persistent revenue memory, and commercial metrics.
- Phase 2C: DAG / Workflow Engine for parent tasks, subtasks, dependencies, and chained validation.
- Phase 3: WebSocket / Live Runtime dashboard for agents, queue, running tasks, failures, retries, and throughput.
- Phase 4: LLM Integration through OpenAI/Ollama workers after the runtime contract is stable.
- Phase 5: Autonomous Planning where Aion decomposes user goals, delegates work, validates results, fixes failures, and prepares final delivery.
- n8n remains an external integration layer for webhooks, Discord, GitHub, Telegram, Jira, email, and SaaS pipelines.
