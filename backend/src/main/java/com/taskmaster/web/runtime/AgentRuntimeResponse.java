package com.taskmaster.web.runtime;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.AgentStatus;
import com.taskmaster.domain.agent.AgentType;
import java.time.Instant;

public record AgentRuntimeResponse(
    Long id,
    String name,
    AgentType type,
    AgentStatus status,
    Instant lastHeartbeat,
    Instant createdAt
) {

    public static AgentRuntimeResponse from(Agent agent) {
        return new AgentRuntimeResponse(
            agent.getId(),
            agent.getName(),
            agent.getType(),
            agent.getStatus(),
            agent.getLastHeartbeat(),
            agent.getCreatedAt()
        );
    }
}