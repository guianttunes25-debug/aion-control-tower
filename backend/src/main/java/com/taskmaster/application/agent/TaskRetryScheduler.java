package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.RuntimeEventType;
import com.taskmaster.domain.task.Task;
import com.taskmaster.domain.task.TaskStatus;
import com.taskmaster.infrastructure.task.TaskRepository;
import java.time.Instant;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TaskRetryScheduler {

    private final TaskRepository taskRepository;
    private final AgentRuntimeRecorder recorder;

    public TaskRetryScheduler(TaskRepository taskRepository, AgentRuntimeRecorder recorder) {
        this.taskRepository = taskRepository;
        this.recorder = recorder;
    }

    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void moveFailedTasksToRetryPending() {
        Instant now = Instant.now();
        taskRepository.findByStatusAndNextRetryAtBefore(TaskStatus.FAILED, now).stream()
            .filter(task -> task.shouldRetry(now))
            .forEach(this::markRetryPending);
    }

    private void markRetryPending(Task task) {
        task.markRetryPending();
        recorder.info(null, task, "Task #" + task.getId() + " moved to RETRY_PENDING");
        recorder.event(RuntimeEventType.TASK_RETRY_PENDING, null, task, "Task moved to RETRY_PENDING");
    }
}