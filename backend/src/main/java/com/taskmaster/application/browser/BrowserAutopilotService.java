package com.taskmaster.application.browser;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class BrowserAutopilotService {

    private static final List<String> SENSITIVE_TERMS = List.of(
        "senha", "password", "token", "captcha", "pagamento", "payment", "checkout", "cartao", "cartão",
        "comprar", "buy", "enviar", "submit", "publicar", "publish", "login", "cadastro", "signup", "matricula", "matrícula"
    );

    private final Map<String, BrowserAutopilotSession> sessions = new ConcurrentHashMap<>();
    private final BrowserAutopilotLlmService llmService;

    public BrowserAutopilotService(BrowserAutopilotLlmService llmService) {
        this.llmService = llmService;
    }

    public BrowserAutopilotSession createSession(String goal, String startUrl) {
        BrowserAutopilotSession session = new BrowserAutopilotSession("BA-" + UUID.randomUUID(), goal, startUrl);
        sessions.put(session.getId(), session);
        return session;
    }

    public BrowserAutopilotSession observe(String sessionId, BrowserAutopilotObserveCommand observation) {
        BrowserAutopilotSession session = getSession(sessionId);
        session.observe(observation);
        return session;
    }

    public BrowserAutopilotDecision decide(String sessionId) {
        BrowserAutopilotSession session = getSession(sessionId);
        BrowserAutopilotObserveCommand observation = session.getLastObservation();

        if (observation == null) {
            BrowserAutopilotDecision decision = new BrowserAutopilotDecision(
                sessionId,
                "OBSERVE_PAGE",
                "LOW",
                false,
                "Observar a pagina ativa antes de agir.",
                "Nenhum snapshot de pagina foi recebido ainda.",
                "observe_page",
                "",
                true,
                List.of(),
                Instant.now()
            );
            session.decide(decision);
            return decision;
        }

        List<String> policyBlocks = policyBlocks(session, observation);
        BrowserAutopilotDecision decision;

        if (!policyBlocks.isEmpty()) {
            decision = new BrowserAutopilotDecision(
                sessionId,
                "REQUEST_HUMAN_APPROVAL",
                "HIGH",
                true,
                "Pedir aprovacao humana antes de cadastro, login, envio, pagamento ou publicacao.",
                "A pagina ou o objetivo contem acao sensivel.",
                "request_human_approval",
                "",
                false,
                policyBlocks,
                Instant.now()
            );
        } else if ((decision = tryLlmDecision(session, observation)) != null) {
        } else if (isGooglePage(observation.url()) && isCourseGoal(session.getGoal())) {
            decision = new BrowserAutopilotDecision(
                sessionId,
                "RUN_SEARCH",
                "LOW",
                false,
                "Pesquisar cursos de IA gratuitos com certificado e comparar opcoes publicas.",
                "Busca publica no Google e considerada acao segura nesta fase.",
                "run_google_search",
                session.getGoal(),
                true,
                List.of(),
                Instant.now()
            );
        } else if (isCourseGoal(session.getGoal())) {
            decision = new BrowserAutopilotDecision(
                sessionId,
                "EXTRACT_PUBLIC_CONTENT",
                "MEDIUM",
                false,
                "Ler titulo, secoes e chamadas publicas do curso; parar se aparecer login, matricula ou pagamento.",
                "Objetivo de curso detectado; extracao publica e permitida sem preencher formularios.",
                "extract_public_content",
                "",
                true,
                List.of(),
                Instant.now()
            );
        } else {
            decision = new BrowserAutopilotDecision(
                sessionId,
                "HIGHLIGHT_SAFE_ACTIONS",
                "LOW",
                false,
                "Destacar botoes, links e campos visiveis para o humano escolher a proxima acao.",
                "Nenhuma acao sensivel foi detectada no snapshot atual.",
                "highlight_safe_actions",
                "",
                true,
                List.of(),
                Instant.now()
            );
        }

        session.decide(decision);
        return decision;
    }

    public BrowserAutopilotAnswer ask(String sessionId, String question) {
        BrowserAutopilotSession session = getSession(sessionId);
        BrowserAutopilotObserveCommand observation = session.getLastObservation();
        String normalizedQuestion = nullSafe(question);
        List<String> blocks = policyBlocksForQuestion(normalizedQuestion);

        BrowserAutopilotAnswer answer;
        if (!blocks.isEmpty()) {
            answer = new BrowserAutopilotAnswer(
                sessionId,
                "Posso te orientar, mas nao vou executar cadastro, login, senha, captcha, pagamento, envio ou publicacao. O passo seguro e separar as informacoes publicas e pedir sua confirmacao antes de qualquer acao sensivel.",
                observation != null,
                "request_human_approval",
                "",
                false,
                true,
                Instant.now()
            );
        } else {
            String llmAnswer = llmService.answer(session, normalizedQuestion).orElseGet(() -> fallbackAnswer(session, observation, normalizedQuestion));
            String suggestedTool = shouldSearch(normalizedQuestion, observation) ? "run_google_search" : "";
            answer = new BrowserAutopilotAnswer(
                sessionId,
                llmAnswer,
                observation != null,
                suggestedTool,
                suggestedTool.isBlank() ? "" : normalizedQuestion,
                !suggestedTool.isBlank(),
                false,
                Instant.now()
            );
        }

        session.recordAnswer(normalizedQuestion, answer.answer());
        return answer;
    }

    private BrowserAutopilotDecision tryLlmDecision(BrowserAutopilotSession session, BrowserAutopilotObserveCommand observation) {
        return llmService.suggest(session, observation)
            .filter(this::isAllowedLlmDecision)
            .map(suggestion -> new BrowserAutopilotDecision(
                session.getId(),
                suggestion.actionType(),
                suggestion.riskLevel(),
                suggestion.approvalRequired(),
                suggestion.nextAction(),
                "aion-staff sugeriu: " + nullSafe(suggestion.reason()),
                suggestion.toolName(),
                suggestion.toolInput(),
                suggestion.autoExecutable(),
                List.of(),
                Instant.now()
            ))
            .orElse(null);
    }

    private boolean isAllowedLlmDecision(LlmBrowserDecision suggestion) {
        if (suggestion.nextAction().isBlank()) {
            return false;
        }
        if (suggestion.approvalRequired() || "HIGH".equals(suggestion.riskLevel())) {
            return true;
        }
        String nextAction = suggestion.nextAction().toLowerCase(Locale.ROOT);
        return !nextAction.matches(".*(digitar|preencher|enviar|submeter|pagar|comprar|publicar|matricular|cadastrar).*(senha|token|captcha|pagamento|checkout|formulario|formulário|proposta|mensagem|login|cadastro|matricula|matrícula).*");
    }

    public BrowserAutopilotSession recordExecution(String sessionId, String result) {
        BrowserAutopilotSession session = getSession(sessionId);
        session.recordExecution(result);
        return session;
    }

    public BrowserAutopilotSession getSession(String sessionId) {
        BrowserAutopilotSession session = sessions.get(sessionId);
        if (session == null) {
            throw new BrowserAutopilotSessionNotFoundException(sessionId);
        }
        return session;
    }

    public List<BrowserAutopilotSession> listSessions() {
        return sessions.values().stream()
            .sorted((first, second) -> second.getCreatedAt().compareTo(first.getCreatedAt()))
            .toList();
    }

    private List<String> policyBlocks(BrowserAutopilotSession session, BrowserAutopilotObserveCommand observation) {
        String text = (
            nullSafe(observation.url()) + " "
                + nullSafe(observation.title()) + " "
                + String.join(" ", safeList(observation.headings())) + " "
                + String.join(" ", safeList(observation.actionLabels()))
        ).toLowerCase(Locale.ROOT);
        String goal = nullSafe(session.getGoal()).toLowerCase(Locale.ROOT);

        List<String> blocks = new ArrayList<>();
        for (String term : SENSITIVE_TERMS) {
            if (text.contains(term)) {
                blocks.add("Termo sensivel detectado: " + term);
            }
        }
        if (goal.matches(".*(fazer|realizar|executar|preencher|enviar|criar).*\\b(login|cadastro|pagamento|checkout|publica|matricul).*")) {
            blocks.add("Objetivo pede acao sensivel explicita");
        }
        return blocks.stream().distinct().limit(8).toList();
    }

    private List<String> policyBlocksForQuestion(String question) {
        String normalized = nullSafe(question).toLowerCase(Locale.ROOT);
        List<String> blocks = new ArrayList<>();
        for (String term : SENSITIVE_TERMS) {
            if (normalized.contains(term)) {
                blocks.add("Pergunta contem termo sensivel: " + term);
            }
        }
        return blocks.stream().distinct().limit(8).toList();
    }

    private boolean shouldSearch(String question, BrowserAutopilotObserveCommand observation) {
        String normalized = nullSafe(question).toLowerCase(Locale.ROOT);
        boolean asksSearch = normalized.matches(".*(pesquis|procure|buscar|busca|encontr|ache|google|curso|noticia|preco|preço|melhor).* ")
            || normalized.matches(".*(pesquis|procure|buscar|busca|encontr|ache|google|curso|noticia|preco|preço|melhor).*$");
        boolean pageHasLittleContext = observation == null || safeList(observation.headings()).isEmpty();
        return asksSearch && pageHasLittleContext;
    }

    private String fallbackAnswer(BrowserAutopilotSession session, BrowserAutopilotObserveCommand observation, String question) {
        if (shouldSearch(question, observation)) {
            return "Posso pesquisar isso para voce com uma busca segura no Google. Vou parar antes de login, cadastro, matricula, pagamento ou envio de formulario.";
        }
        if (observation != null) {
            return "Pelo contexto da pagina atual, vejo: " + nullSafe(observation.title()) + ". Posso te ajudar a analisar os links e proximos passos seguros sem executar nada sensivel.";
        }
        return "Posso responder com o que sei localmente ou observar a pagina atual para usar contexto. Para pesquisar na web, autorize a aba e use uma busca segura.";
    }

    private boolean isGooglePage(String url) {
        return nullSafe(url).contains("google.");
    }

    private boolean isCourseGoal(String goal) {
        String normalized = nullSafe(goal).toLowerCase(Locale.ROOT);
        return normalized.contains("curso") || normalized.contains("aula") || normalized.contains("treinamento") || normalized.contains("aprend");
    }

    private List<String> safeList(List<String> values) {
        return values == null ? List.of() : values;
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }
}