package com.taskmaster.application.browser;

import java.time.Instant;
import java.util.List;

public record BrowserAutopilotDecision(
    String sessionId,
    String actionType,
    String riskLevel,
    boolean approvalRequired,
    String nextAction,
    String reason,
    List<String> blockedByPolicy,
    Instant decidedAt
) {
}