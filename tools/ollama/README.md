# AION Staff Ollama Model

Este diretório guarda o `Modelfile` local usado para criar o cérebro `aion-staff` a partir do `qwen2.5-coder:14b`.

## Criar ou atualizar o modelo

```powershell
cd C:\AI-Company\projects\taskmaster
ollama create aion-staff -f tools\ollama\aion-staff.Modelfile
```

## Validar

```powershell
ollama list
ollama run aion-staff "Responda em JSON: {\"status\":\"ok\"}"
```

## Observação

O `num_ctx 32768` aumenta a janela de contexto, mas também aumenta uso de memória e latência. O primeiro uso pode levar mais tempo enquanto o Ollama carrega o modelo. Se a máquina ficar pesada, reduza `aion.browser-autopilot.llm.num-ctx` em `backend/src/main/resources/application.yml` para `8192` ou `4096`.