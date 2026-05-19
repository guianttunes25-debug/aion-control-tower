package com.taskmaster.application.browser;

public record LlmBrowserDecision(
    String actionType,
    String riskLevel,
    boolean approvalRequired,
    String nextAction,
    String reason,
    String toolName,
    String toolInput,
    boolean autoExecutable
) {
}