package com.fooddonation.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fooddonation.entity.DeliveryAgentProfile;
import com.fooddonation.enums.UserStatus;

@Repository
public interface DeliveryAgentProfileRepository extends JpaRepository<DeliveryAgentProfile, Long> {

	Optional<DeliveryAgentProfile> findByUserId(Long userId);

	@Query("SELECT d FROM DeliveryAgentProfile d WHERE d.isAvailable = true AND d.user.status = :status")
	List<DeliveryAgentProfile> findAvailableAgents(@Param("status") UserStatus status);

	default List<DeliveryAgentProfile> findAvailableAgents() {
		return findAvailableAgents(UserStatus.ACTIVE);
	}

}
