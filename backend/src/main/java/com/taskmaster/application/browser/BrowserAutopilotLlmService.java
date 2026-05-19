package com.taskmaster.application.browser;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class BrowserAutopilotLlmService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final boolean enabled;
    private final String baseUrl;
    private final String model;
    private final String keepAlive;
    private final double temperature;
    private final int numCtx;
    private final int numPredict;
    private final int timeoutSeconds;

    public BrowserAutopilotLlmService(
        ObjectMapper objectMapper,
        @Value("${aion.browser-autopilot.llm.enabled:true}") boolean enabled,
        @Value("${aion.browser-autopilot.llm.base-url:http://localhost:11434}") String baseUrl,
        @Value("${aion.browser-autopilot.llm.model:aion-staff}") String model,
        @Value("${aion.browser-autopilot.llm.keep-alive:30s}") String keepAlive,
        @Value("${aion.browser-autopilot.llm.temperature:0.1}") double temperature,
        @Value("${aion.browser-autopilot.llm.num-ctx:32768}") int numCtx,
        @Value("${aion.browser-autopilot.llm.num-predict:320}") int numPredict,
        @Value("${aion.browser-autopilot.llm.timeout-seconds:20}") int timeoutSeconds
    ) {
        this.objectMapper = objectMapper;
        this.enabled = enabled;
        this.baseUrl = baseUrl;
        this.model = model;
        this.keepAlive = keepAlive;
        this.temperature = temperature;
        this.numCtx = numCtx;
        this.numPredict = numPredict;
        this.timeoutSeconds = timeoutSeconds;
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(2))
            .build();
    }

    public Optional<LlmBrowserDecision> suggest(BrowserAutopilotSession session, BrowserAutopilotObserveCommand observation) {
        if (!enabled) {
            return Optional.empty();
        }

        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                "model", model,
                "stream", false,
                "keep_alive", keepAlive,
                "options", Map.of(
                    "temperature", temperature,
                    "num_ctx", numCtx,
                    "num_predict", numPredict
                ),
                "messages", List.of(
                    Map.of(
                        "role", "system",
                        "content", systemPrompt()
                    ),
                    Map.of(
                        "role", "user",
                        "content", userPrompt(session, observation)
                    )
                )
            ));

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/chat"))
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return Optional.empty();
            }

            Map<String, Object> payload = objectMapper.readValue(response.body(), new TypeReference<>() { });
            Object message = payload.get("message");
            if (!(message instanceof Map<?, ?> messageMap)) {
                return Optional.empty();
            }

            Object content = messageMap.get("content");
            if (!(content instanceof String rawContent)) {
                return Optional.empty();
            }

            return parseDecision(rawContent);
        } catch (IOException | InterruptedException | RuntimeException exception) {
            if (exception instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return Optional.empty();
        }
    }

    private Optional<LlmBrowserDecision> parseDecision(String rawContent) throws IOException {
        String content = rawContent.trim()
            .replace("```json", "")
            .replace("```", "")
            .trim();
        int start = content.indexOf('{');
        int end = content.lastIndexOf('}');
        if (start < 0 || end <= start) {
            return Optional.empty();
        }

        Map<String, Object> parsed = objectMapper.readValue(content.substring(start, end + 1), new TypeReference<>() { });
        String actionType = stringValue(parsed.get("actionType"));
        String riskLevel = normalizeRisk(stringValue(parsed.get("riskLevel")));
        String nextAction = stringValue(parsed.get("nextAction"));
        String reason = stringValue(parsed.get("reason"));
        String toolName = normalizeToolName(stringValue(parsed.get("toolName")), actionType);
        String toolInput = stringValue(parsed.get("toolInput"));

        if (actionType.isBlank() || nextAction.isBlank()) {
            return Optional.empty();
        }

        boolean approvalRequired = Boolean.TRUE.equals(parsed.get("approvalRequired")) || "HIGH".equals(riskLevel);
        boolean autoExecutable = Boolean.TRUE.equals(parsed.get("autoExecutable")) && !approvalRequired && isSafeAutoTool(toolName);
        return Optional.of(new LlmBrowserDecision(actionType, riskLevel, approvalRequired, nextAction, reason, toolName, toolInput, autoExecutable));
    }

    private String systemPrompt() {
        return "Voce e o BrowserAutopilotAgent do AION, operando como Staff Software Engineer local. Responda somente JSON valido. "
            + "Nunca sugira digitar senha, token, captcha, pagamento, publicacao, envio de formulario, cadastro ou matricula. "
            + "Quando encontrar acao sensivel, use actionType REQUEST_HUMAN_APPROVAL, riskLevel HIGH e approvalRequired true. "
            + "Acoes permitidas: OBSERVE_PAGE, RUN_SEARCH, EXTRACT_PUBLIC_CONTENT, HIGHLIGHT_SAFE_ACTIONS, REQUEST_HUMAN_APPROVAL. "
                + "Ferramentas disponiveis: observe_page, run_google_search, extract_public_content, highlight_safe_actions, request_human_approval. "
                + "Use autoExecutable true somente para observe_page, run_google_search, extract_public_content ou highlight_safe_actions quando o risco for LOW ou MEDIUM. "
            + "Antes de decidir, considere seguranca, reversibilidade, observabilidade e manutencao. "
                + "Formato: {\"actionType\":\"...\",\"riskLevel\":\"LOW|MEDIUM|HIGH\",\"approvalRequired\":false,\"nextAction\":\"...\",\"reason\":\"...\",\"toolName\":\"...\",\"toolInput\":\"...\",\"autoExecutable\":true}.";
    }

    private String userPrompt(BrowserAutopilotSession session, BrowserAutopilotObserveCommand observation) {
        return "Objetivo: " + session.getGoal()
            + "\nURL: " + observation.url()
            + "\nTitulo: " + observation.title()
            + "\nHeadings: " + safeJoin(observation.headings())
            + "\nAcoes visiveis: " + safeJoin(observation.actionLabels())
            + "\nQuantidade de acoes: " + observation.clickables()
            + "\nDecida o proximo passo pequeno, seguro e reversivel.";
    }

    private String safeJoin(List<String> values) {
        return values == null || values.isEmpty() ? "nenhum" : String.join(" | ", values.stream().limit(30).toList());
    }

    private String normalizeRisk(String riskLevel) {
        String normalized = riskLevel.toUpperCase();
        if (normalized.equals("LOW") || normalized.equals("MEDIUM") || normalized.equals("HIGH")) {
            return normalized;
        }
        return "MEDIUM";
    }

    private String normalizeToolName(String toolName, String actionType) {
        String normalized = toolName.toLowerCase().replace('-', '_').trim();
        if (isKnownTool(normalized)) {
            return normalized;
        }
        return switch (actionType) {
            case "OBSERVE_PAGE" -> "observe_page";
            case "RUN_SEARCH" -> "run_google_search";
            case "EXTRACT_PUBLIC_CONTENT" -> "extract_public_content";
            case "HIGHLIGHT_SAFE_ACTIONS" -> "highlight_safe_actions";
            default -> "request_human_approval";
        };
    }

    private boolean isKnownTool(String toolName) {
        return List.of("observe_page", "run_google_search", "extract_public_content", "highlight_safe_actions", "request_human_approval").contains(toolName);
    }

    private boolean isSafeAutoTool(String toolName) {
        return List.of("observe_page", "run_google_search", "extract_public_content", "highlight_safe_actions").contains(toolName);
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }
}