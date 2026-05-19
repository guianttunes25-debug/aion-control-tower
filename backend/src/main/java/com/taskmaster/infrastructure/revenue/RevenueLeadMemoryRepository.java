package com.taskmaster.infrastructure.revenue;

import com.taskmaster.domain.revenue.RevenueLeadMemory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RevenueLeadMemoryRepository extends JpaRepository<RevenueLeadMemory, Long> {

    Optional<RevenueLeadMemory> findByLeadName(String leadName);

    List<RevenueLeadMemory> findAllByOrderByUpdatedAtDesc();

    List<RevenueLeadMemory> findAllByOrderByLeadScoreDescUpdatedAtDesc();
}