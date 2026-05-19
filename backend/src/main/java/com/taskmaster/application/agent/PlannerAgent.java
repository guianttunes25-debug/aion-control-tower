package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.AgentType;
import com.taskmaster.domain.task.Task;
import org.springframework.stereotype.Component;

@Component
public class PlannerAgent implements AionAgentWorker {

    private final SimulatedAgentExecutor executor;

    public PlannerAgent(SimulatedAgentExecutor executor) {
        this.executor = executor;
    }

    @Override
    public AgentType type() {
        return AgentType.PLANNER;
    }

    @Override
    public void execute(Task task, Agent agent) {
        executor.execute(task, agent);
    }
}