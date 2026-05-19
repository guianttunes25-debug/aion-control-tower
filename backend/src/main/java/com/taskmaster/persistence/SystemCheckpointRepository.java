package com.taskmaster.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemCheckpointRepository extends JpaRepository<SystemCheckpoint, Long> {
}