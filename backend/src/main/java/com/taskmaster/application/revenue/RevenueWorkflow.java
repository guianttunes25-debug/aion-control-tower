package com.taskmaster.application.revenue;

import com.taskmaster.domain.revenue.RevenueLeadMemory;
import com.taskmaster.domain.task.Task;
import java.util.List;

public record RevenueWorkflow(
    String workflowId,
    String leadName,
    String niche,
    RevenueLeadMemory memory,
    List<Task> tasks
) {
}