package com.taskmaster.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.Instant;

@Entity
public class SystemCheckpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String marker;

    @Column(nullable = false)
    private Instant createdAt;

    protected SystemCheckpoint() {
    }

    public SystemCheckpoint(String marker, Instant createdAt) {
        this.marker = marker;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getMarker() {
        return marker;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}