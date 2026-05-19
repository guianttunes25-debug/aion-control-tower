package com.taskmaster.infrastructure.agent;

import com.taskmaster.domain.agent.AgentExecutionLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgentExecutionLogRepository extends JpaRepository<AgentExecutionLog, Long> {
}