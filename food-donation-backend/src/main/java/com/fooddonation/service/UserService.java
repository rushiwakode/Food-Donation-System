package com.fooddonation.service;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.dto.response.UserResponse;
import com.fooddonation.enums.UserStatus;

public interface UserService {

	UserResponse getCurrentUser(String email);

	UserResponse getUserById(Long id);

	UserResponse updateProfile(String email, Object updateRequest);

	String uploadProfileImage(String email, MultipartFile file);

	void changePassword(String email, String oldPassword, String newPassword);

	PageResponse<UserResponse> getAllUsers(String role, String query, Pageable pageable);

	void updateUserStatus(Long userId, UserStatus status);

	void deleteUser(Long userId);

	UserResponse approveNgo(Long userId);

	UserResponse approveDonor(Long userId);

}
