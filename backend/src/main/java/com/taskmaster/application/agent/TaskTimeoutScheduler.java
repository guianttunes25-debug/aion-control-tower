package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.AgentStatus;
import com.taskmaster.domain.agent.RuntimeEventType;
import com.taskmaster.domain.task.Task;
import com.taskmaster.domain.task.TaskStatus;
import com.taskmaster.infrastructure.agent.AgentRepository;
import com.taskmaster.infrastructure.agent.TaskAssignmentRepository;
import com.taskmaster.infrastructure.task.TaskRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TaskTimeoutScheduler {

    private final TaskRepository taskRepository;
    private final AgentRepository agentRepository;
    private final TaskAssignmentRepository assignmentRepository;
    private final AgentRuntimeRecorder recorder;

    public TaskTimeoutScheduler(
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

    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void failStaleRunningTasks() {
        Instant runningThreshold = Instant.now().minus(5, ChronoUnit.MINUTES);
        taskRepository.findByStatusAndUpdatedAtBefore(TaskStatus.RUNNING, runningThreshold)
            .forEach(this::failTask);
    }

    @Scheduled(fixedDelay = 20000)
    @Transactional
    public void recoverTasksAssignedToOfflineAgents() {
        taskRepository.findByStatus(TaskStatus.RUNNING).forEach(task ->
            assignmentRepository.findFirstByTaskIdOrderByAssignedAtDesc(task.getId())
                .filter(assignment -> assignment.getAgent().getStatus() == AgentStatus.OFFLINE)
                .ifPresent(assignment -> recoverTask(task, assignment.getAgent()))
        );
    }

    private void failTask(Task task) {
        task.fail("Task exceeded running timeout");
        Agent agent = agentRepository.findFirstByStatusOrderByLastHeartbeatDesc(AgentStatus.BUSY).orElse(null);
        recorder.warn(agent, task, "Task #" + task.getId() + " failed after running timeout");
        recorder.event(RuntimeEventType.TASK_FAILED, agent, task, "Task #" + task.getId() + " failed after running timeout");
        recorder.event(RuntimeEventType.TASK_RETRY_SCHEDULED, agent, task, "Task retry scheduled at " + task.getNextRetryAt());
    }

    private void recoverTask(Task task, Agent agent) {
        task.fail("Assigned agent went offline");
        recorder.warn(agent, task, "Task #" + task.getId() + " recovered from offline agent");
        recorder.event(RuntimeEventType.TASK_RECOVERED, agent, task, "Task recovered from offline agent");
        recorder.event(RuntimeEventType.TASK_RETRY_SCHEDULED, agent, task, "Task retry scheduled at " + task.getNextRetryAt());
    }
}