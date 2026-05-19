package com.taskmaster.infrastructure.task;

import com.taskmaster.domain.task.Task;
import com.taskmaster.domain.task.TaskStatus;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TaskRepository extends JpaRepository<Task, Long> {

	Optional<Task> findFirstByStatusOrderByCreatedAtAsc(TaskStatus status);

	Optional<Task> findFirstByStatusInOrderByCreatedAtAsc(List<TaskStatus> statuses);

	List<Task> findTop20ByStatusInOrderByCreatedAtAsc(List<TaskStatus> statuses);

	@Query(value = """
		select t.*
		from tasks t
		where t.status in ('PENDING', 'RETRY_PENDING')
		and (
			t.blocked_by_task_id is null
			or exists (
				select 1
				from tasks blocker
				where blocker.id = t.blocked_by_task_id
				and blocker.status = 'COMPLETED'
			)
		)
		order by t.created_at asc
		limit 20
		""", nativeQuery = true)
	List<Task> findTop20DispatchableTasks();

	List<Task> findByStatusAndUpdatedAtBefore(TaskStatus status, Instant updatedAt);

	List<Task> findByStatus(TaskStatus status);

	List<Task> findByStatusIn(List<TaskStatus> statuses);

	List<Task> findByStatusAndNextRetryAtBefore(TaskStatus status, Instant nextRetryAt);

	List<Task> findByWorkflowIdOrderByWorkflowStepAsc(String workflowId);

	long countByStatus(TaskStatus status);

	@Query(value = "select coalesce(avg(extract(epoch from (completed_at - started_at))), 0) from tasks where completed_at is not null and started_at is not null", nativeQuery = true)
	double averageExecutionSeconds();
}