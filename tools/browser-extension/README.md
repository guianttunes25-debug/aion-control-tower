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
3. Escreva o objetivo, por exemplo: `Pesquisar cursos de IA gratuitos com certificado`.
4. Clique em `Autorizar nesta pagina`.
5. Clique em `Observar pagina` para capturar titulo, URL e acoes visiveis.
6. Clique em `Pesquisar no Google` para iniciar a busca.
7. Em paginas de curso, use `Destacar acoes` para visualizar links, botoes e campos que o AION poderia operar com autorizacao futura.

## O que ela faz

- Observa a pagina ativa e lista acoes visiveis.
- Destaca botoes, links e campos de formulario.
- Executa uma pesquisa segura no Google quando autorizado.
- Abre Google em nova aba quando a aba atual nao e Google.

## O que ela nao faz

- Nao digita login, senha, token ou dados sensiveis.
- Nao resolve captcha.
- Nao envia formulario, proposta, mensagem, pagamento ou publicacao.
- Nao faz cadastro ou matricula por conta propria.

## Proximo passo tecnico

Para virar Autopilot completo, a extensao deve enviar snapshots da pagina para um endpoint local do backend, por exemplo:

```text
POST http://localhost:8080/browser-autopilot/sessions/{id}/observe
POST http://localhost:8080/browser-autopilot/sessions/{id}/propose-action
POST http://localhost:8080/browser-autopilot/sessions/{id}/approve-action
```

O backend decide o proximo passo e a extensao executa apenas comandos aprovados, como clicar em um seletor publico ou preencher um campo nao sensivel.