package com.taskmaster.infrastructure.agent;

import com.taskmaster.domain.agent.TaskAssignment;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {

	Optional<TaskAssignment> findFirstByTaskIdOrderByAssignedAtDesc(Long taskId);
}