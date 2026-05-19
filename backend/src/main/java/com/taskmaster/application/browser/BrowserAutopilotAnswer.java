package com.taskmaster.application.browser;

import java.time.Instant;

public record BrowserAutopilotAnswer(
    String sessionId,
    String answer,
    boolean usedPageContext,
    String suggestedToolName,
    String suggestedToolInput,
    boolean autoExecutable,
    boolean approvalRequired,
    Instant answeredAt
) {
}