package com.taskmaster.domain.agent;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "agents")
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AgentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AgentStatus status;

    private Instant lastHeartbeat;

    @Column(nullable = false)
    private Instant createdAt;

    protected Agent() {
    }

    public Agent(String name, AgentType type) {
        this.name = name;
        this.type = type;
        this.status = AgentStatus.AVAILABLE;
        this.lastHeartbeat = Instant.now();
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public void markBusy() {
        this.status = AgentStatus.BUSY;
        heartbeat();
    }

    public void markAvailable() {
        this.status = AgentStatus.AVAILABLE;
        heartbeat();
    }

    public void markOffline() {
        this.status = AgentStatus.OFFLINE;
    }

    public void heartbeat() {
        this.lastHeartbeat = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public AgentType getType() {
        return type;
    }

    public AgentStatus getStatus() {
        return status;
    }

    public Instant getLastHeartbeat() {
        return lastHeartbeat;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}