package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.AgentExecutionLog;
import com.taskmaster.domain.agent.AgentLogLevel;
import com.taskmaster.domain.agent.RuntimeEvent;
import com.taskmaster.domain.agent.RuntimeEventType;
import com.taskmaster.domain.task.Task;
import com.taskmaster.infrastructure.agent.AgentExecutionLogRepository;
import com.taskmaster.infrastructure.agent.RuntimeEventRepository;
import org.springframework.stereotype.Component;

@Component
public class AgentRuntimeRecorder {

    private final AgentExecutionLogRepository logRepository;
    private final RuntimeEventRepository eventRepository;

    public AgentRuntimeRecorder(AgentExecutionLogRepository logRepository, RuntimeEventRepository eventRepository) {
        this.logRepository = logRepository;
        this.eventRepository = eventRepository;
    }

    public void info(Agent agent, Task task, String message) {
        logRepository.save(new AgentExecutionLog(agent, task, AgentLogLevel.INFO, message));
    }

    public void warn(Agent agent, Task task, String message) {
        logRepository.save(new AgentExecutionLog(agent, task, AgentLogLevel.WARN, message));
    }

    public void event(RuntimeEventType type, Agent agent, Task task, String message) {
        eventRepository.save(new RuntimeEvent(type, agent, task, message));
    }
}