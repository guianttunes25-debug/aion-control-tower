package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.AgentStatus;
import com.taskmaster.domain.agent.AgentType;
import com.taskmaster.domain.agent.RuntimeEventType;
import com.taskmaster.domain.agent.TaskAssignment;
import com.taskmaster.domain.task.Task;
import com.taskmaster.infrastructure.agent.AgentRepository;
import com.taskmaster.infrastructure.agent.TaskAssignmentRepository;
import com.taskmaster.infrastructure.task.TaskRepository;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgentDispatchService {

    private static final Logger logger = LoggerFactory.getLogger(AgentDispatchService.class);

    private final TaskRepository taskRepository;
    private final AgentRepository agentRepository;
    private final TaskAssignmentRepository assignmentRepository;
    private final AgentRuntimeRecorder recorder;

    public AgentDispatchService(
        TaskRepository taskRepository,
        AgentRepository agentRepository,
        TaskAssignmentRepository assignmentRepository,
        AgentRuntimeRecorder recorder
    ) {
        this.taskRepository = taskRepository;
        this.agentRepository = agentRepository;
        this.assignmentRepository = assignmentRepository;
        this.recorder = recorder;
    }

    @Transactional
    public List<DispatchCommand> dispatchPendingTasks() {
        List<Task> tasks = taskRepository.findTop20DispatchableTasks();
        if (tasks.isEmpty()) {
            return List.of();
        }

        Map<AgentType, Queue<Agent>> availableAgents = availableAgentsByType();
        List<DispatchCommand> commands = new ArrayList<>();

        for (Task task : tasks) {
            Queue<Agent> candidates = availableAgents.get(task.getRequiredAgentType());
            if (candidates == null || candidates.isEmpty()) {
                continue;
            }

            Agent agent = candidates.poll();
            assign(task, agent);
            commands.add(new DispatchCommand(task.getId(), agent.getId()));
        }

        return commands;
    }

    private Map<AgentType, Queue<Agent>> availableAgentsByType() {
        Map<AgentType, Queue<Agent>> agentsByType = new EnumMap<>(AgentType.class);
        agentRepository.findByStatusOrderByLastHeartbeatDesc(AgentStatus.AVAILABLE)
            .forEach(agent -> agentsByType.computeIfAbsent(agent.getType(), ignored -> new ArrayDeque<>()).add(agent));
        return agentsByType;
    }

    private void assign(Task task, Agent agent) {
        logger.info("[AION] Assigning task #{} to {}", task.getId(), agent.getName());
        task.assign();
        agent.markBusy();
        recorder.info(agent, task, "Assigned task #" + task.getId() + " to " + agent.getName());
        recorder.event(RuntimeEventType.TASK_ASSIGNED, agent, task, "Task assigned to " + agent.getName());
        recorder.event(RuntimeEventType.AGENT_BUSY, agent, task, agent.getName() + " marked BUSY");
        assignmentRepository.save(new TaskAssignment(task, agent));
    }
}