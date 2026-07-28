package com.fooddonation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fooddonation.entity.DeliveryAssignment;
import com.fooddonation.enums.AssignmentStatus;

@Repository
public interface DeliveryAssignmentRepository extends JpaRepository<DeliveryAssignment, Long> {

	Optional<DeliveryAssignment> findByClaimId(Long claimId);

	Page<DeliveryAssignment> findByAgentId(Long agentId, Pageable pageable);

	Page<DeliveryAssignment> findByAgentIdAndStatus(Long agentId, AssignmentStatus status, Pageable pageable);

	Page<DeliveryAssignment> findByStatus(AssignmentStatus status, Pageable pageable);

	long countByAgentId(Long agentId);

	long countByStatus(AssignmentStatus status);

	@Query("SELECT a FROM DeliveryAssignment a WHERE a.status IN :statuses")
	Page<DeliveryAssignment> findByStatuses(@Param("statuses") List<AssignmentStatus> statuses, Pageable pageable);

	@Query("SELECT COUNT(a) FROM DeliveryAssignment a WHERE a.agent.id = :agentId AND a.status = :status")
	long countByAgentIdAndStatus(@Param("agentId") Long agentId, @Param("status") AssignmentStatus status);
}
