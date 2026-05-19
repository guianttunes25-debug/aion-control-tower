package com.taskmaster.domain.task;

public enum TaskStatus {
    PENDING,
    RETRY_PENDING,
    ASSIGNED,
    RETRYING,
    WAITING_APPROVAL,
    RUNNING,
    COMPLETED,
    FAILED
}