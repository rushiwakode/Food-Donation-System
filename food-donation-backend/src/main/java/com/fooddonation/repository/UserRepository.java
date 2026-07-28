package com.fooddonation.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.fooddonation.entity.User;
import com.fooddonation.enums.UserStatus;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);

	boolean existsByEmail(String email);

	boolean existsByPhone(String phone);

	Optional<User> findByEmailVerifyToken(String token);

	Optional<User> findByPasswordResetToken(String token);

	@Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
	Page<User> findByRoleName(@Param("roleName") String roleName, Pageable pageable);

	@Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName AND "
			+ "(LOWER(u.fullName) LIKE LOWER(CONCAT('%',:q,'%')) OR "
			+ "LOWER(u.email) LIKE LOWER(CONCAT('%',:q,'%')))")
	Page<User> searchByRole(@Param("roleName") String roleName, @Param("q") String query, Pageable pageable);

	@Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = :roleName")
	long countByRole(@Param("roleName") String roleName);

	@Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = :roleName AND u.status = :status")
	long countByRoleAndStatus(@Param("roleName") String roleName, @Param("status") UserStatus status);
}
