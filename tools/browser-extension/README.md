# AION Browser Autopilot Extension

Extensao local para transformar uma aba aberta do Chrome/Edge em uma superficie operavel pelo AION, mantendo autorizacao humana por aba.

## Como instalar no Chrome ou Edge

1. Abra `chrome://extensions` ou `edge://extensions`.
2. Ative o modo de desenvolvedor.
3. Clique em `Carregar sem compactacao`.
4. Selecione a pasta `C:\AI-Company\projects\taskmaster\tools\browser-extension`.
5. Fixe a extensao `AION Browser Autopilot` na barra do navegador.

## Como usar agora

1. Abra `https://www.google.com`.
2. Clique na extensao `AION Browser Autopilot`.
3. Escreva uma pergunta ou objetivo, por exemplo: `Qual curso gratuito de IA e melhor para iniciante?`.
4. Clique em `Autorizar nesta pagina`.
5. Use `Perguntar` para receber uma resposta humana usando o contexto da pagina quando disponivel.
6. Clique em `Observar pagina` para capturar titulo, URL e acoes visiveis.
7. Clique em `Decidir proximo passo` para enviar o snapshot ao `BrowserAutopilotAgent` local.
8. Quando a decisao sugerir uma ferramenta segura, a extensao executa automaticamente e tambem libera `Executar ferramenta segura` para repetir a acao.
9. Use `Auto loop seguro` para rodar ate 3 ciclos observar-decidir-executar.
10. Clique em `Pesquisar no Google` para iniciar a busca manualmente quando quiser.
11. Em paginas de curso, use `Destacar acoes` para visualizar links, botoes e campos que o AION poderia operar com autorizacao futura.

## O que ela faz

- Observa a pagina ativa e lista acoes visiveis.
- Cria uma sessao no backend local do AION.
- Responde perguntas em linguagem humana dentro do popup.
- Envia snapshots para o `BrowserAutopilotAgent` decidir a proxima acao segura.
- Usa o `qwen2.5-coder:14b` via Ollama quando o backend precisa raciocinar sobre a pagina.
- Cai para regras deterministicas se o Ollama estiver offline ou demorar.
- Recebe `toolName`, `toolInput` e `autoExecutable` do backend.
- Pode iniciar uma pesquisa segura quando a pergunta pede busca externa.
- Executa ferramentas seguras como `observe_page`, `highlight_safe_actions`, `run_google_search` e `extract_public_content`.
- Roda Auto Loop seguro com limite de 3 passos.
- Para o Auto Loop quando encontra risco alto, exige humano, repete a mesma acao ou inicia navegacao/pesquisa.
- Destaca botoes, links e campos de formulario.
- Executa uma pesquisa segura no Google quando autorizado.
- Abre Google em nova aba quando a aba atual nao e Google.

## O que ela nao faz

- Nao digita login, senha, token ou dados sensiveis.
- Nao resolve captcha.
- Nao envia formulario, proposta, mensagem, pagamento ou publicacao.
- Nao faz cadastro ou matricula por conta propria.

## Proximo passo tecnico

O ciclo local atual ja usa os endpoints:

```text
POST http://localhost:8080/browser-autopilot/sessions
POST http://localhost:8080/browser-autopilot/sessions/{id}/observe
POST http://localhost:8080/browser-autopilot/sessions/{id}/ask
POST http://localhost:8080/browser-autopilot/sessions/{id}/decide
POST http://localhost:8080/browser-autopilot/sessions/{id}/execution-result
```

O backend consulta o Ollama em `http://localhost:11434` com o modelo `qwen2.5-coder:14b`. A Safety Policy continua sendo obrigatoria e bloqueia acoes sensiveis mesmo quando o modelo sugerir algo arriscado.

O proximo passo e permitir que a extensao execute apenas comandos aprovados pelo backend, como clicar em um seletor publico ou preencher um campo nao sensivel.