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
@Table(name = "runtime_events")
public class RuntimeEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RuntimeEventType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private Agent agent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    protected RuntimeEvent() {
    }

    public RuntimeEvent(RuntimeEventType type, Agent agent, Task task, String message) {
        this.type = type;
        this.agent = agent;
        this.task = task;
        this.message = message;
        this.timestamp = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public RuntimeEventType getType() {
        return type;
    }

    public Agent getAgent() {
        return agent;
    }

    public Task getTask() {
        return task;
    }

    public String getMessage() {
        return message;
    }

    public Instant getTimestamp() {
        return timestamp;
    }
}