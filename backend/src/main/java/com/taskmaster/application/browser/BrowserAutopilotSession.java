package com.taskmaster.application.browser;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class BrowserAutopilotSession {

    private final String id;
    private final String goal;
    private final String startUrl;
    private final Instant createdAt;
    private final List<String> activity = new ArrayList<>();
    private BrowserAutopilotObserveCommand lastObservation;
    private BrowserAutopilotDecision lastDecision;
    private String status;

    public BrowserAutopilotSession(String id, String goal, String startUrl) {
        this.id = id;
        this.goal = goal;
        this.startUrl = startUrl;
        this.createdAt = Instant.now();
        this.status = "AUTHORIZED";
        this.activity.add("Sessao autorizada para objetivo: " + goal);
    }

    public void observe(BrowserAutopilotObserveCommand observation) {
        this.lastObservation = observation;
        this.status = "OBSERVED";
        this.activity.add(0, "Pagina observada: " + nullSafe(observation.title()) + " com " + observation.clickables() + " acao(oes) visiveis.");
    }

    public void decide(BrowserAutopilotDecision decision) {
        this.lastDecision = decision;
        this.status = decision.approvalRequired() ? "WAITING_HUMAN" : "READY_TO_EXECUTE";
        this.activity.add(0, "Decisao: " + decision.actionType() + " / risco " + decision.riskLevel() + ".");
    }

    public void recordExecution(String result) {
        this.status = "EXECUTION_RECORDED";
        this.activity.add(0, "Resultado registrado: " + nullSafe(result));
    }

    public void recordAnswer(String question, String answer) {
        this.status = "ANSWERED";
        this.activity.add(0, "Pergunta respondida: " + nullSafe(question));
        this.activity.add(0, "Resposta AION: " + nullSafe(answer));
    }

    public String getId() {
        return id;
    }

    public String getGoal() {
        return goal;
    }

    public String getStartUrl() {
        return startUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public List<String> getActivity() {
        return List.copyOf(activity);
    }

    public BrowserAutopilotObserveCommand getLastObservation() {
        return lastObservation;
    }

    public BrowserAutopilotDecision getLastDecision() {
        return lastDecision;
    }

    public String getStatus() {
        return status;
    }

    private String nullSafe(String value) {
        return value == null || value.isBlank() ? "sem titulo" : value;
    }
}