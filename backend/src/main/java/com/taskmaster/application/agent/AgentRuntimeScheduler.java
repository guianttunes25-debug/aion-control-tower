package com.taskmaster.application.agent;

import java.util.List;
import java.util.concurrent.ExecutorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AgentRuntimeScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AgentRuntimeScheduler.class);

    private final AgentDispatchService dispatchService;
    private final AionAgentExecutionService executionService;
    private final ExecutorService aionRuntimeExecutor;

    public AgentRuntimeScheduler(
        AgentDispatchService dispatchService,
        AionAgentExecutionService executionService,
        ExecutorService aionRuntimeExecutor
    ) {
        this.dispatchService = dispatchService;
        this.executionService = executionService;
        this.aionRuntimeExecutor = aionRuntimeExecutor;
    }

    @Scheduled(fixedDelay = 5000)
    public void schedulePendingTasks() {
        List<DispatchCommand> commands = dispatchService.dispatchPendingTasks();
        if (commands.isEmpty()) {
            return;
        }

        logger.info("[AION] Dispatching {} task(s) to available agents", commands.size());
        commands.forEach(command -> aionRuntimeExecutor.submit(() -> executionService.execute(command.taskId(), command.agentId())));
    }
}