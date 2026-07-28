package com.fooddonation.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fooddonation.entity.DonorProfile;

@Repository
public interface DonorProfileRepository extends JpaRepository<DonorProfile, Long> {

	Optional<DonorProfile> findByUserId(Long userId);

}
