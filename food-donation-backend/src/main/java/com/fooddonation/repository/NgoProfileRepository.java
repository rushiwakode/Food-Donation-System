package com.fooddonation.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fooddonation.entity.NgoProfile;

@Repository
public interface NgoProfileRepository extends JpaRepository<NgoProfile, Long> {

	Optional<NgoProfile> findByUserId(Long userId);

}
