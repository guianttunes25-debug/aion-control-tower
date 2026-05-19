package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.AgentType;
import com.taskmaster.domain.task.Task;
import org.springframework.stereotype.Component;

@Component
public class ResearchAgent implements AionAgentWorker {

    private final SimulatedAgentExecutor executor;

    public ResearchAgent(SimulatedAgentExecutor executor) {
        this.executor = executor;
    }

    @Override
    public AgentType type() {
        return AgentType.RESEARCH;
    }

    @Override
    public void execute(Task task, Agent agent) {
        executor.execute(task, agent);
    }
}