package com.fooddonation.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fooddonation.entity.FoodDonation;
import com.fooddonation.enums.DonationStatus;
import com.fooddonation.enums.FoodType;

@Repository
public interface FoodDonationRepository extends JpaRepository<FoodDonation, Long> {

	Page<FoodDonation> findByDonorId(Long donorId, Pageable pageable);

	Page<FoodDonation> findByDonorIdAndStatus(Long donorId, DonationStatus status, Pageable pageable);

	Page<FoodDonation> findByStatus(DonationStatus status, Pageable pageable);

	@Query("SELECT d FROM FoodDonation d WHERE d.status = :status AND d.pickupCity = :city ORDER BY d.expiresAt ASC")
	Page<FoodDonation> findAvailableByCity(@Param("status") DonationStatus status, @Param("city") String city,
			Pageable pageable);

	@Query("SELECT d FROM FoodDonation d WHERE d.status IN :statuses AND " + "(:q IS NULL OR :q = '' OR "
			+ "LOWER(d.title) LIKE LOWER(CONCAT('%',:q,'%')) OR "
			+ "LOWER(d.description) LIKE LOWER(CONCAT('%',:q,'%'))) AND "
			+ "(:city IS NULL OR LOWER(d.pickupCity) = LOWER(:city)) AND "
			+ "(:categoryId IS NULL OR d.category.id = :categoryId) AND "
			+ "(:foodType IS NULL OR d.foodType = :foodType)")
	Page<FoodDonation> searchDonations(@Param("statuses") List<DonationStatus> statuses, @Param("q") String query,
			@Param("city") String city, @Param("categoryId") Long categoryId, @Param("foodType") FoodType foodType,
			Pageable pageable);

	@Query("SELECT d FROM FoodDonation d WHERE d.status = com.fooddonation.enums.DonationStatus.APPROVED AND d.expiresAt < :now")
	List<FoodDonation> findExpiredDonations(@Param("now") LocalDateTime now);

	// Stats
	long countByStatus(DonationStatus status);

	long countByDonorId(Long donorId);

	@Query("SELECT COUNT(d) FROM FoodDonation d WHERE d.createdAt >= :from")
	long countSince(@Param("from") LocalDateTime from);

	@Query("SELECT d.pickupCity, COUNT(d) FROM FoodDonation d GROUP BY d.pickupCity ORDER BY COUNT(d) DESC")
	List<Object[]> getDonationsByCity();

	@Query("SELECT FUNCTION('MONTH', d.createdAt) as month, COUNT(d) as cnt "
			+ "FROM FoodDonation d WHERE FUNCTION('YEAR', d.createdAt) = :year "
			+ "GROUP BY FUNCTION('MONTH', d.createdAt) ORDER BY month")
	List<Object[]> getMonthlyStats(@Param("year") int year);

	@Query("SELECT d FROM FoodDonation d WHERE d.status = 'APPROVED' AND d.expiresAt > :now "
			+ "AND d.pickupCity = :city ORDER BY d.expiresAt ASC")
	List<FoodDonation> findNearbyAvailable(@Param("city") String city, @Param("now") LocalDateTime now,
			Pageable pageable);
}
