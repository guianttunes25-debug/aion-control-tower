package com.taskmaster.infrastructure.agent;

import com.taskmaster.domain.agent.RuntimeEvent;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RuntimeEventRepository extends JpaRepository<RuntimeEvent, Long> {

	List<RuntimeEvent> findTop50ByOrderByTimestampDesc();
}