package com.taskmaster.web.revenue;

import com.taskmaster.application.revenue.RevenueWorkflow;
import com.taskmaster.web.task.TaskResponse;
import java.util.List;

public record RevenueWorkflowResponse(
    String workflowId,
    String leadName,
    String niche,
    RevenueLeadMemoryResponse memory,
    List<TaskResponse> tasks
) {

    public static RevenueWorkflowResponse from(RevenueWorkflow workflow) {
        return new RevenueWorkflowResponse(
            workflow.workflowId(),
            workflow.leadName(),
            workflow.niche(),
            RevenueLeadMemoryResponse.from(workflow.memory()),
            workflow.tasks().stream().map(TaskResponse::from).toList()
        );
    }
}