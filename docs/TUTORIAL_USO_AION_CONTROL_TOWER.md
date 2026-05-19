# Tutorial de Uso do AION Control Tower

Este guia mostra como usar o AION Control Tower no dia a dia, do jeito mais prático possível.

## 1. O Que Foi Atualizado

O projeto agora tem estes módulos principais:

- **CEO Agent**: conversa com você, responde status, consulta telemetria e pode usar GPT local quando você ativar.
- **Browser Operator SDR**: ajuda a procurar trabalhos em 99Freelas, Workana e Google, registrar oportunidades e gerar propostas.
- **Browser Autopilot**: cria uma sessão de atuação em página com autorização humana, escopo permitido, bloqueios e plano seguro.
- **Product & Content Studio**: cria pacotes de produto, prompts de estampa, anúncios, roteiros de reels e legendas.
- **Approval Console**: permite aprovar, rejeitar ou pedir modificação em decisões comerciais críticas.
- **Control Tower**: mostra saúde do sistema, agentes, leads, runtime e eventos.
- **Agent Graph**: mostra a hierarquia dos agentes.
- **Ops Room**: mostra a sala operacional 2D dos agentes.
- **Launcher EXE**: abre o sistema local com um executável Windows.

## 2. Como Abrir o Sistema

### Opção Mais Fácil: Pelo EXE

Execute:

```powershell
& "C:\AI-Company\projects\taskmaster\dist\windows\AION Company\AION Company.exe"
```

O launcher tenta:

1. subir/verificar o PostgreSQL via Docker;
2. verificar o backend;
3. verificar o frontend;
4. abrir o painel em `http://localhost:5173`.

### Opção Manual

Suba o banco:

```powershell
cd C:\AI-Company\projects\taskmaster\infra
docker compose up -d
```

Suba o backend:

```powershell
cd C:\AI-Company\projects\taskmaster\backend
$env:JAVA_HOME='C:\Program Files\Java\jdk-24'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
mvn spring-boot:run
```

Suba o frontend:

```powershell
cd C:\AI-Company\projects\taskmaster\frontend
npm run dev -- --host 127.0.0.1
```

Abra:

```text
http://localhost:5173
```

## 3. Como Usar o CEO Agent

O CEO Agent fica no topo do painel, em **Linha direta com o CEO**.

### Modos de Resposta

- **Rápido**: não usa GPU. Bom para status, leads, agentes e comandos simples.
- **Auto**: usa resposta rápida para comandos simples e GPT local para perguntas abertas.
- **GPT**: sempre chama o modelo local `qwen2.5-coder:14b`. Pode usar GPU.

Use **Rápido** no dia a dia para economizar GPU.

Use **GPT** quando quiser raciocínio mais elaborado, por exemplo:

```text
CEO, analise essa estratégia e me diga o próximo passo mais inteligente.
```

### Perguntas Úteis Para o CEO

```text
CEO, o que está sendo feito agora?
```

```text
Qual é o lead prioritário?
```

```text
Quais agentes estão ativos?
```

```text
Procurar trabalhos no 99Freelas
```

```text
Criar produto com estampa e reels
```

## 4. Como Procurar Trabalhos no 99Freelas, Workana ou Google

Use o módulo **Browser Operator SDR**.

### Passo a Passo

1. Escolha a plataforma: `Google`, `99Freelas` ou `Workana`.
2. Ajuste as palavras-chave.
3. Clique em **Abrir busca em nova aba**.
4. Faça login manualmente se o site pedir.
5. Copie o texto de uma vaga interessante.
6. Cole no campo **Cole aqui o texto da vaga...**.
7. Clique em **Analisar texto da vaga**.
8. Revise título, URL, orçamento e resumo.
9. Clique em **Salvar oportunidade**.

Depois disso, o sistema mostra:

- tipo de serviço;
- fit de 1 a 10;
- se a AION consegue executar;
- plano de execução;
- proposta pronta para copiar.

### O Que a AION Executa Melhor

AION tem melhor fit para:

- automação de atendimento;
- chatbot;
- WhatsApp comercial;
- landing pages;
- sites simples;
- CRM;
- dashboards;
- integrações;
- backend/frontend;
- APIs;
- organização de processos comerciais.

### O Que Precisa Revisão Humana

Revise com cuidado antes de aceitar trabalhos de:

- design avançado;
- vídeo complexo;
- app mobile nativo;
- tráfego pago;
- pagamentos;
- scraping agressivo;
- tarefas que exigem senha, captcha ou dados sensíveis;
- qualquer envio externo em seu nome.

## 5. Como Usar o Browser Autopilot

Use o **Browser Autopilot** quando quiser um fluxo parecido com: abrir uma página, pedir autorização e preparar atuação na página.

### Passo a Passo

1. Cole a URL da página.
2. Descreva o que a IA deve fazer nessa página.
3. Clique em **Abrir página e pedir autorização**.
4. Revise o escopo permitido e o que está bloqueado.
5. Clique em **Autorizar atuação**.
6. Clique em **Executar plano seguro**.

Hoje esta tela cria o gate de permissão e o plano seguro. Para a IA clicar, ler DOM, rolar e preencher campos em sites externos de verdade, o próximo passo técnico é conectar um worker local com Playwright ou uma extensão do navegador.

Nunca autorize automaticamente:

- login;
- senha;
- captcha;
- pagamento;
- publicação;
- envio de proposta/mensagem;
- alteração externa sensível.

## 6. Como Criar Produtos, Estampas e Reels

Use o módulo **Product & Content Studio**.

### Passo a Passo

1. Preencha o produto, por exemplo: `camiseta estampada`.
2. Preencha o nicho, por exemplo: `donos de mercados locais`.
3. Preencha o público-alvo.
4. Ajuste o estilo visual.
5. Informe os canais: Instagram, Facebook, Shopee, Mercado Livre etc.
6. Clique em **Gerar pacote de produto**.

O sistema gera:

- prompt de imagem para criar a estampa com IA;
- título e descrição para marketplace;
- roteiro de reels;
- legenda para Instagram/Facebook;
- checklist de publicação.

### Fluxo Seguro Para Vender Produto

1. Gere 3 variações da estampa com IA.
2. Verifique se não há marca registrada, personagem protegido ou cópia de arte.
3. Aplique a arte em mockup.
4. Valide custo, fornecedor, prazo e margem.
5. Revise o anúncio.
6. Publique manualmente no marketplace.
7. Poste reels manualmente ou pelo Meta Business Suite.

O sistema prepara os ativos, mas não publica nem vende sozinho.

## 7. Como Usar o Approval Console

O **Approval Console** serve para decisões humanas.

Você pode clicar:

- **Aprovar**: registra aprovação local.
- **Rejeitar**: registra rejeição local.
- **Modificar**: indica que precisa ajustar antes de seguir.

Hoje essa decisão fica salva localmente no navegador. Backend real de aprovação pode ser criado depois.

## 8. Como Interpretar a Latência

No painel, a latência mistura várias chamadas da UI.

Referência prática:

- `20ms-150ms`: ótimo para local.
- `150ms-600ms`: aceitável.
- acima de `600ms`: observar, mas não é necessariamente problema.

O backend isolado costuma responder rápido. O CEO em modo GPT é mais lento porque chama o modelo local e pode usar GPU.

## 9. O Que Não Fazer Ainda

Não deixe o sistema fazer sozinho:

- criar contas;
- preencher senhas;
- passar captcha;
- enviar proposta sem revisão;
- publicar produto sem revisão;
- postar reels automaticamente;
- pagar tráfego;
- aceitar venda ou contrato;
- usar dados sensíveis no chat.

Quando aparecer senha, token, API key ou dado sensível, digite diretamente no site ou terminal. Não cole no chat.

## 10. Rotina Recomendada Diária

1. Abra o AION pelo `.exe`.
2. Pergunte ao CEO: `o que está sendo feito agora?`.
3. Veja o lead prioritário.
4. Pesquise 5 a 10 oportunidades no Browser Operator.
5. Salve as melhores oportunidades.
6. Copie e revise propostas.
7. Gere 1 pacote no Product Studio.
8. Publique ou envie somente depois de revisar manualmente.
9. Registre retorno real: objeção, interesse, reunião, orçamento e follow-up.

## 11. Quando Usar Cada Modo

Use **CEO Rápido** para:

- status;
- leads;
- agentes;
- Browser Operator;
- Product Studio;
- abrir sites.

Use **CEO GPT** para:

- estratégia;
- análise de proposta;
- revisar texto de venda;
- criar posicionamento;
- decidir prioridade entre oportunidades;
- melhorar oferta.

Use **Approval Console** antes de qualquer ação que represente compromisso externo.