package com.taskmaster.domain.agent;

import com.taskmaster.domain.task.Task;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "agent_execution_logs")
public class AgentExecutionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private Agent agent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    private AgentLogLevel level;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    protected AgentExecutionLog() {
    }

    public AgentExecutionLog(Agent agent, Task task, AgentLogLevel level, String message) {
        this.agent = agent;
        this.task = task;
        this.level = level;
        this.message = message;
        this.timestamp = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Agent getAgent() {
        return agent;
    }

    public Task getTask() {
        return task;
    }

    public AgentLogLevel getLevel() {
        return level;
    }

    public String getMessage() {
        return message;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}