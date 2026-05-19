package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.AgentType;
import com.taskmaster.domain.task.Task;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class AionAgentRegistry {

    private final Map<AgentType, AionAgentWorker> workers = new EnumMap<>(AgentType.class);

    public AionAgentRegistry(List<AionAgentWorker> workers) {
        workers.forEach(worker -> this.workers.put(worker.type(), worker));
    }

    public void execute(Task task, Agent agent) {
        AionAgentWorker worker = workers.get(task.getRequiredAgentType());
        if (worker == null) {
            throw new IllegalStateException("No worker registered for agent type " + task.getRequiredAgentType());
        }
        worker.execute(task, agent);
    }
}