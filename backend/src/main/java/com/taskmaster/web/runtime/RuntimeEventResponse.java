package com.taskmaster.web.runtime;

import com.taskmaster.domain.agent.RuntimeEvent;
import com.taskmaster.domain.agent.RuntimeEventType;
import java.time.Instant;

public record RuntimeEventResponse(
    Long id,
    RuntimeEventType type,
    Long agentId,
    Long taskId,
    String message,
    Instant timestamp
) {

    public static RuntimeEventResponse from(RuntimeEvent event) {
        Long agentId = event.getAgent() == null ? null : event.getAgent().getId();
        Long taskId = event.getTask() == null ? null : event.getTask().getId();
        return new RuntimeEventResponse(
            event.getId(),
            event.getType(),
            agentId,
            taskId,
            event.getMessage(),
            event.getTimestamp()
        );
    }
}