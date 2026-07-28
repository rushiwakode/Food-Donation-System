package com.fooddonation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fooddonation.entity.DonationImage;

@Repository
public interface DonationImageRepository extends JpaRepository<DonationImage, Long> {

	List<DonationImage> findByDonationIdOrderBySortOrderAsc(Long donationId);

	void deleteByDonationId(Long donationId);

}
