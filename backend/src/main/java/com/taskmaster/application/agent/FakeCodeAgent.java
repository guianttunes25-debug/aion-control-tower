package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.RuntimeEventType;
import com.taskmaster.domain.task.Task;
import java.util.concurrent.ThreadLocalRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class FakeCodeAgent {

    private static final Logger logger = LoggerFactory.getLogger(FakeCodeAgent.class);

    private final AgentRuntimeRecorder recorder;

    public FakeCodeAgent(AgentRuntimeRecorder recorder) {
        this.recorder = recorder;
    }

    public void execute(Task task, Agent agent) {
        logger.info("[FakeCodeAgent] Executing task #{}", task.getId());
        task.start();
        recorder.info(agent, task, "Executing task #" + task.getId());
        recorder.event(RuntimeEventType.TASK_STARTED, agent, task, "Task execution started");
        simulateWork();

        if (shouldFail(task)) {
            String reason = "FakeCodeAgent simulated failure";
            task.fail(reason);
            agent.markAvailable();
            recorder.warn(agent, task, reason + " for task #" + task.getId());
            recorder.event(RuntimeEventType.TASK_FAILED, agent, task, reason);
            recorder.event(RuntimeEventType.TASK_RETRY_SCHEDULED, agent, task, "Task retry scheduled at " + task.getNextRetryAt());
            recorder.event(RuntimeEventType.AGENT_AVAILABLE, agent, task, agent.getName() + " marked AVAILABLE after failure");
            logger.warn("[FakeCodeAgent] Task #{} failed and retry was scheduled", task.getId());
            return;
        }

        task.complete();
        agent.markAvailable();
        recorder.info(agent, task, "Completed task #" + task.getId());
        recorder.event(RuntimeEventType.TASK_COMPLETED, agent, task, "Task execution completed");
        recorder.event(RuntimeEventType.AGENT_AVAILABLE, agent, task, agent.getName() + " marked AVAILABLE");
        logger.info("[FakeCodeAgent] Task #{} completed", task.getId());
    }

    private boolean shouldFail(Task task) {
        if (task.hasRetrySimulationMarker()) {
            return task.getRetryCount() == 0;
        }
        return ThreadLocalRandom.current().nextInt(100) < 20;
    }

    private void simulateWork() {
        try {
            Thread.sleep(5000);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
        }
    }
}