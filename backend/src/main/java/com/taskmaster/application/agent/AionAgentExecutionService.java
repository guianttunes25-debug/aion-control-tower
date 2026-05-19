package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.RuntimeEventType;
import com.taskmaster.domain.task.Task;
import com.taskmaster.infrastructure.agent.AgentRepository;
import com.taskmaster.infrastructure.task.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AionAgentExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(AionAgentExecutionService.class);

    private final TaskRepository taskRepository;
    private final AgentRepository agentRepository;
    private final AionAgentRegistry agentRegistry;
    private final AgentRuntimeRecorder recorder;

    public AionAgentExecutionService(
        TaskRepository taskRepository,
        AgentRepository agentRepository,
        AionAgentRegistry agentRegistry,
        AgentRuntimeRecorder recorder
    ) {
        this.taskRepository = taskRepository;
        this.agentRepository = agentRepository;
        this.agentRegistry = agentRegistry;
        this.recorder = recorder;
    }

    @Transactional
    public void execute(Long taskId, Long agentId) {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new IllegalStateException("Task not found: " + taskId));
        Agent agent = agentRepository.findById(agentId).orElseThrow(() -> new IllegalStateException("Agent not found: " + agentId));

        try {
            agentRegistry.execute(task, agent);
        } catch (RuntimeException exception) {
            String reason = "Agent execution crashed: " + exception.getMessage();
            task.fail(reason);
            agent.markAvailable();
            recorder.warn(agent, task, reason);
            recorder.event(RuntimeEventType.TASK_FAILED, agent, task, reason);
            recorder.event(RuntimeEventType.TASK_RETRY_SCHEDULED, agent, task, "Task retry scheduled at " + task.getNextRetryAt());
            recorder.event(RuntimeEventType.AGENT_AVAILABLE, agent, task, agent.getName() + " marked AVAILABLE after execution crash");
            logger.error("[{}] Execution crashed for task #{}", agent.getName(), task.getId(), exception);
        }
    }
}