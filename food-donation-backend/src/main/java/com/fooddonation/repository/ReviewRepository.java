package com.fooddonation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fooddonation.entity.Review;
import com.fooddonation.enums.ReviewType;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

	List<Review> findByRevieweeId(Long revieweeId);

	boolean existsByDonationIdAndReviewerIdAndReviewType(Long donationId, Long reviewerId, ReviewType type);

	@Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :revieweeId")
	Double getAverageRating(@Param("revieweeId") Long revieweeId);

}
