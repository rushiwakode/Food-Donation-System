package com.fooddonation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fooddonation.entity.PickupTracking;

@Repository
public interface PickupTrackingRepository extends JpaRepository<PickupTracking, Long> {

	List<PickupTracking> findByAssignmentIdOrderByTrackedAtAsc(Long assignmentId);

}
