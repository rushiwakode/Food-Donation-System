package com.fooddonation.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fooddonation.entity.NgoClaim;
import com.fooddonation.enums.ClaimStatus;

@Repository
public interface NgoClaimRepository extends JpaRepository<NgoClaim, Long> {

	Page<NgoClaim> findByNgoId(Long ngoId, Pageable pageable);

	Page<NgoClaim> findByDonationId(Long donationId, Pageable pageable);

	Page<NgoClaim> findByStatus(ClaimStatus status, Pageable pageable);

	Optional<NgoClaim> findByDonationIdAndNgoId(Long donationId, Long ngoId);

	boolean existsByDonationIdAndNgoId(Long donationId, Long ngoId);

	long countByNgoId(Long ngoId);

	long countByStatus(ClaimStatus status);

	@Query("SELECT c FROM NgoClaim c WHERE c.ngo.id = :ngoId AND c.status = :status")
	Page<NgoClaim> findByNgoIdAndStatus(@Param("ngoId") Long ngoId, @Param("status") ClaimStatus status,
			Pageable pageable);
}
