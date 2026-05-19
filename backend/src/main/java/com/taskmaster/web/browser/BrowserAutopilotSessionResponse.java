package com.taskmaster.web.browser;

import com.taskmaster.application.browser.BrowserAutopilotDecision;
import com.taskmaster.application.browser.BrowserAutopilotObserveCommand;
import com.taskmaster.application.browser.BrowserAutopilotSession;
import java.time.Instant;
import java.util.List;

public record BrowserAutopilotSessionResponse(
    String id,
    String goal,
    String startUrl,
    String status,
    Instant createdAt,
    BrowserAutopilotObserveCommand lastObservation,
    BrowserAutopilotDecision lastDecision,
    List<String> activity
) {
    public static BrowserAutopilotSessionResponse from(BrowserAutopilotSession session) {
        return new BrowserAutopilotSessionResponse(
            session.getId(),
            session.getGoal(),
            session.getStartUrl(),
            session.getStatus(),
            session.getCreatedAt(),
            session.getLastObservation(),
            session.getLastDecision(),
            session.getActivity()
        );
    }
}