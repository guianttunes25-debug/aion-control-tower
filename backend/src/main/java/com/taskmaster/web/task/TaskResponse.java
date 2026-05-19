package com.taskmaster.web.task;

import com.taskmaster.domain.agent.AgentType;
import com.taskmaster.domain.task.Task;
import com.taskmaster.domain.task.TaskStatus;
import java.time.Instant;

public record TaskResponse(
    Long id,
    String title,
    String description,
    String workflowId,
    Integer workflowStep,
    Long blockedByTaskId,
    AgentType requiredAgentType,
    TaskStatus status,
    Instant createdAt,
    Instant updatedAt,
    int retryCount,
    int maxRetries,
    String lastFailureReason,
    Instant nextRetryAt
) {

    public static TaskResponse from(Task task) {
        return new TaskResponse(
            task.getId(),
            task.getTitle(),
            task.getDescription(),
            task.getWorkflowId(),
            task.getWorkflowStep(),
            task.getBlockedByTaskId(),
            task.getRequiredAgentType(),
            task.getStatus(),
            task.getCreatedAt(),
            task.getUpdatedAt(),
            task.getRetryCount(),
            task.getMaxRetries(),
            task.getLastFailureReason(),
            task.getNextRetryAt()
        );
    }
}