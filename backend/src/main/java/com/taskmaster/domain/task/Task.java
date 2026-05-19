package com.taskmaster.domain.task;

import com.taskmaster.domain.agent.AgentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String workflowId;

    private Integer workflowStep;

    private Long blockedByTaskId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AgentType requiredAgentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @Column(nullable = false)
    private int retryCount;

    @Column(nullable = false)
    private int maxRetries;

    @Column(length = 2000)
    private String lastFailureReason;

    private Instant nextRetryAt;

    private Instant startedAt;

    private Instant completedAt;

    protected Task() {
    }

    public Task(String title, String description) {
        this(title, description, AgentType.CODE);
    }

    public Task(String title, String description, AgentType requiredAgentType) {
        this.title = title;
        this.description = description;
        this.requiredAgentType = requiredAgentType == null ? AgentType.CODE : requiredAgentType;
        this.status = TaskStatus.PENDING;
        this.maxRetries = 3;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void complete() {
        this.status = TaskStatus.COMPLETED;
        this.completedAt = Instant.now();
    }

    public void assign() {
        this.status = TaskStatus.ASSIGNED;
    }

    public void start() {
        this.status = this.status == TaskStatus.RETRY_PENDING ? TaskStatus.RETRYING : TaskStatus.RUNNING;
        this.startedAt = Instant.now();
    }

    public void fail(String reason) {
        this.status = TaskStatus.FAILED;
        this.retryCount++;
        this.lastFailureReason = reason;
        this.nextRetryAt = Instant.now().plusSeconds(nextRetryDelaySeconds());
    }

    public void markRetryPending() {
        this.status = TaskStatus.RETRY_PENDING;
    }

    public void waitForHumanApproval() {
        this.status = TaskStatus.WAITING_APPROVAL;
    }

    public void attachToWorkflow(String workflowId, int workflowStep, Long blockedByTaskId) {
        this.workflowId = workflowId;
        this.workflowStep = workflowStep;
        this.blockedByTaskId = blockedByTaskId;
    }

    public boolean canRetry() {
        return retryCount < maxRetries;
    }

    public boolean shouldRetry(Instant now) {
        return status == TaskStatus.FAILED && canRetry() && nextRetryAt != null && !nextRetryAt.isAfter(now);
    }

    public boolean hasRetrySimulationMarker() {
        return description != null && description.contains("force-fail-once");
    }

    private long nextRetryDelaySeconds() {
        return switch (retryCount) {
            case 1 -> 60;
            case 2 -> 120;
            default -> 300;
        };
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public AgentType getRequiredAgentType() {
        return requiredAgentType;
    }

    public String getWorkflowId() {
        return workflowId;
    }

    public Integer getWorkflowStep() {
        return workflowStep;
    }

    public Long getBlockedByTaskId() {
        return blockedByTaskId;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public int getRetryCount() {
        return retryCount;
    }

    public int getMaxRetries() {
        return maxRetries;
    }

    public String getLastFailureReason() {
        return lastFailureReason;
    }

    public Instant getNextRetryAt() {
        return nextRetryAt;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}