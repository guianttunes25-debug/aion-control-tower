package com.taskmaster.web.runtime;

public record RuntimeMetricsResponse(
    long tasksCompleted,
    long tasksFailed,
    double averageExecutionSeconds,
    long activeAgents
) {
}