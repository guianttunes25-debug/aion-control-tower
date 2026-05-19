package com.taskmaster.domain.agent;

public enum RuntimeEventType {
    TASK_ASSIGNED,
    TASK_RETRY_SCHEDULED,
    TASK_RETRY_PENDING,
    TASK_STARTED,
    TASK_COMPLETED,
    TASK_FAILED,
    TASK_RECOVERED,
    AGENT_BUSY,
    AGENT_AVAILABLE,
    AGENT_HEARTBEAT,
    AGENT_OFFLINE
}