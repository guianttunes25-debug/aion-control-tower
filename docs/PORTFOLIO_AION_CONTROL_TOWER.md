# Portfolio - AION Control Tower

## Resumo Executivo

O **AION Control Tower** e um sistema local de operacao com IA criado para coordenar agentes, acompanhar runtime, apoiar prospeccao comercial, gerar produtos/conteudo e manter decisoes criticas sob aprovacao humana.

A proposta do projeto e simular e evoluir uma pequena **AI Company local**, com backend real, banco persistente, painel operacional, agentes especializados e fluxo comercial voltado a validacao de produto-mercado.

## Problema Que o Projeto Resolve

Pequenos negocios, freelancers e operadores digitais costumam enfrentar tres dificuldades ao tentar usar IA no dia a dia:

- falta de organizacao entre pesquisa, proposta, execucao e acompanhamento;
- uso de IA sem memoria operacional e sem visibilidade do que esta acontecendo;
- automacoes arriscadas demais, principalmente em tarefas com login, senha, publicacao, pagamento ou envio externo.

O AION Control Tower resolve isso criando um painel de comando onde a IA auxilia, organiza, recomenda e prepara artefatos, mas mantem o humano no controle das decisoes sensiveis.

## Solucao

O sistema combina:

- **Backend Spring Boot** com persistencia em PostgreSQL;
- **Runtime de agentes** com tarefas, atribuicoes, eventos, retry e metricas;
- **Frontend React** com painel operacional em tempo real;
- **CEO Agent** para conversa executiva local;
- **Browser Operator SDR** para busca assistida de oportunidades;
- **Browser Autopilot** para sessao de atuacao em pagina com autorizacao humana;
- **Product & Content Studio** para produtos, estampas, anuncios e reels;
- **Automation & Learning Center** para execucao automatica assistida e memoria de aprendizado;
- **Approval Console** para manter a decisao humana em acoes criticas;
- **Launcher Windows EXE** para abrir o ambiente local com menos friccao.

## Principais Funcionalidades

### 1. Control Tower

Painel principal com:

- status do sistema;
- saude da API;
- status do PostgreSQL;
- heartbeat;
- latencia;
- metricas de runtime;
- leads prioritarios;
- feed de eventos.

### 2. CEO Agent

Chat executivo local para consultar e comandar o sistema.

Modos disponiveis:

- **Rapido**: responde sem acionar GPU;
- **Auto**: usa resposta local para comandos simples e GPT local para perguntas abertas;
- **GPT**: chama o modelo local `qwen2.5-coder:14b` via Ollama.

O CEO responde sobre status, leads, agentes, oportunidades, produtos e automacoes.

### 3. Browser Operator SDR

Modulo para prospeccao comercial assistida.

Permite:

- abrir buscas no Google, 99Freelas e Workana;
- registrar oportunidades manualmente;
- analisar texto de vaga;
- detectar tipo de servico;
- calcular fit comercial;
- classificar se a AION consegue executar;
- gerar plano de execucao;
- preparar rascunho de proposta.

O sistema nao faz login, nao passa captcha e nao envia proposta sem revisao humana.

### 4. Browser Autopilot

Modulo inspirado no fluxo de autorizacao de agentes que atuam em paginas.

Permite:

- informar URL e objetivo;
- abrir pagina em nova aba;
- criar sessao de permissao;
- listar acoes permitidas e bloqueadas;
- autorizar atuacao por tarefa;
- gerar plano seguro antes de agir;
- bloquear login, senha, captcha, pagamento, publicacao e envio externo sem aprovacao.

O controle completo de DOM, cliques, rolagem e preenchimento em sites externos exige o proximo passo tecnico: Browser Research Agent com Playwright local ou extensao de navegador.

### 5. Product & Content Studio

Modulo para criacao assistida de produtos digitais/comerciais.

Gera:

- conceito de produto;
- prompt de imagem para estampa ou arte;
- titulo e descricao para marketplace;
- roteiro de reels;
- legenda para Instagram/Facebook;
- checklist de publicacao.

A publicacao continua manual ou dependente de aprovacao humana.

### 6. Automation & Learning Center

Modulo para execucao automatica assistida e aprendizado por curso.

Permite:

- criar uma tarefa automatica local;
- gerar plano e artefatos;
- abrir curso, aula ou artigo no navegador;
- salvar resumo/transcricao como memoria;
- aplicar aprendizados salvos em novas execucoes.

As automacoes sao deliberadamente seguras: login, senha, captcha, publicacao, envio, pagamento e alteracoes externas continuam bloqueados ate aprovacao humana.

### 7. Agent Graph

Visualizacao da hierarquia de agentes usando React Flow.

Mostra:

- CEO Agent;
- CTO Agent;
- Agent Manager;
- Dispatcher;
- agentes especialistas e workers.

### 8. Ops Room

Sala operacional 2D dos agentes, com estacoes visuais para planejamento, pesquisa, receita, recuperacao, resposta e deploy.

### 9. Approval Console

Console de decisao humana para registrar:

- aprovacao;
- rejeicao;
- necessidade de modificacao.

Foi criado para impedir que o sistema avance sozinho em acoes comerciais ou tecnicas sensiveis.

## Arquitetura Tecnica

### Backend

- Java 21;
- Spring Boot 3.4.5;
- Maven;
- Spring Web;
- Spring Data JPA;
- Flyway;
- PostgreSQL;
- Actuator;
- Validations;
- endpoints REST para tarefas, runtime, agentes, eventos e revenue workflows.

### Banco de Dados

- PostgreSQL 16 via Docker Compose;
- persistencia de tarefas;
- agentes;
- atribuicoes;
- logs de execucao;
- eventos de runtime;
- memoria comercial de leads;
- checkpoints do sistema.

### Frontend

- React 19;
- Vite;
- TypeScript;
- TailwindCSS;
- React Flow;
- integracao com backend via proxy `/api`;
- integracao com Ollama via proxy `/ollama`.

### IA Local

- Ollama;
- modelo `qwen2.5-coder:14b`;
- uso economico de GPU atraves de modos de resposta;
- contexto reduzido para evitar consumo excessivo.

### Distribuicao Local

- Launcher Windows gerado com `jpackage`;
- executavel `AION Company.exe`;
- inicializacao assistida de PostgreSQL, backend, frontend e dashboard.

## Diferenciais do Projeto

- Arquitetura local, sem depender de SaaS externo para operar o MVP.
- Runtime real com agentes, eventos, retry e metricas.
- Foco em receita e validacao comercial, nao apenas automacao tecnica.
- CEO Agent com modo economico e modo GPT local.
- Guardrails claros para login, senha, captcha, publicacao, pagamento e envio externo.
- UI operacional completa, em vez de uma pagina de marketing.
- Capacidade de aprender com cursos/artigos e reutilizar memoria em novos planos.
- Fluxo alinhado a operacao real: lead, contato, objecao, oferta, tentativa, pagamento e retencao.

## Status Atual

O projeto ja possui:

- backend funcional;
- PostgreSQL local;
- dashboard React;
- runtime de agentes;
- revenue workflow;
- painel de controle;
- CEO Chat;
- Browser Operator SDR;
- Browser Autopilot;
- Product & Content Studio;
- Automation & Learning Center;
- Approval Console;
- EXE local para Windows;
- tutorial de uso.

Validacoes recentes:

- build do frontend aprovado;
- lint do frontend aprovado;
- build/test do backend aprovado;
- `/actuator/health` retornando `UP`;
- painel exibindo API e PostgreSQL online;
- smoke test dos principais fluxos locais aprovado.

## Limitacoes Atuais

- O backend ainda nao possui suite ampla de testes automatizados.
- Algumas memorias da UI ainda ficam no `localStorage` antes de migracao completa para o backend.
- A automacao de navegador e assistida, nao autonoma para login, senha, captcha ou envio externo.
- Publicacao em marketplace/redes sociais ainda exige revisao humana.
- O uso do GPT local depende do Ollama e pode acionar GPU.

## Roteiro de Demonstracao

1. Abrir o `AION Company.exe` ou iniciar backend/frontend manualmente.
2. Mostrar o painel `AION CONTROL TOWER` online.
3. Demonstrar o CEO Agent em modo Rapido.
4. Perguntar: `CEO, o que esta sendo feito agora?`.
5. Abrir o Browser Operator SDR e simular analise de uma oportunidade.
6. Mostrar geracao de proposta assistida.
7. Abrir Product & Content Studio e gerar pacote de produto.
8. Abrir Browser Autopilot, criar uma sessao, autorizar escopo e mostrar o plano seguro.
9. Abrir Automation & Learning Center, salvar um aprendizado e criar uma execucao assistida.
10. Mostrar Approval Console como camada de seguranca.
11. Fechar explicando a arquitetura local, o runtime de agentes e o foco em receita.

## Como Explicar em Uma Frase

O AION Control Tower e uma central local de comando para operar uma AI Company: ela coordena agentes, apoia prospeccao, cria artefatos comerciais, aprende com memoria e mantem decisoes sensiveis sob controle humano.

## Possiveis Evolucoes

- Persistir todas as memorias da UI no backend;
- criar testes automatizados para backend e frontend;
- adicionar autenticacao;
- criar painel multiusuario;
- implementar aprovacoes persistentes;
- integrar calendario, e-mail e CRM;
- transformar o Browser Operator em automacao assistida com Playwright controlado por politicas;
- adicionar exportacao de relatorios e propostas em PDF;
- publicar releases versionadas do EXE.
