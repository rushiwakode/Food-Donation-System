package com.fooddonation.repository;

import java.util.Optional;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fooddonation.entity.ProfileChangeRequest;
import com.fooddonation.enums.*;

@Repository
public interface ProfileChangeRequestRepository extends JpaRepository<ProfileChangeRequest, Long> {

	Page<ProfileChangeRequest> findByUserId(Long userId, Pageable pageable);

	Page<ProfileChangeRequest> findByStatus(RequestStatus status, Pageable pageable);

	// User cannot have more than one PENDING/OTP_SENT request for the same field
	@Query("SELECT r FROM ProfileChangeRequest r WHERE r.user.id = :userId " + "AND r.fieldType = :fieldType "
			+ "AND r.status IN ('PENDING','APPROVED','OTP_SENT')")
	Optional<ProfileChangeRequest> findActivePendingByUserAndField(@Param("userId") Long userId,
			@Param("fieldType") FieldType fieldType);

	long countByStatus(RequestStatus status);

}
