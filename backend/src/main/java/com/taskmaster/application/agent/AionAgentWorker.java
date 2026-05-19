package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.AgentType;
import com.taskmaster.domain.task.Task;

public interface AionAgentWorker {

    AgentType type();

    void execute(Task task, Agent agent);
}