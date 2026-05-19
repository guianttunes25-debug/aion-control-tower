package com.taskmaster.infrastructure.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.AgentStatus;
import com.taskmaster.domain.agent.AgentType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgentRepository extends JpaRepository<Agent, Long> {

    Optional<Agent> findByName(String name);

    Optional<Agent> findFirstByStatusOrderByLastHeartbeatDesc(AgentStatus status);

    List<Agent> findByStatusOrderByLastHeartbeatDesc(AgentStatus status);

    Optional<Agent> findFirstByStatusAndTypeOrderByLastHeartbeatDesc(AgentStatus status, AgentType type);

    long countByStatus(AgentStatus status);
}