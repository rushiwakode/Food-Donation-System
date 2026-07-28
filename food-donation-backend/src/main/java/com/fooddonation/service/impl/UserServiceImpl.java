package com.fooddonation.service.impl;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.dto.response.UserResponse;
import com.fooddonation.entity.DeliveryAgentProfile;
import com.fooddonation.entity.DonorProfile;
import com.fooddonation.entity.NgoProfile;
import com.fooddonation.entity.Role;
import com.fooddonation.entity.User;
import com.fooddonation.enums.NotificationType;
import com.fooddonation.enums.UserStatus;
import com.fooddonation.exception.BadRequestException;
import com.fooddonation.exception.ResourceNotFoundException;
import com.fooddonation.repository.DeliveryAgentProfileRepository;
import com.fooddonation.repository.DonorProfileRepository;
import com.fooddonation.repository.NgoProfileRepository;
import com.fooddonation.repository.UserRepository;
import com.fooddonation.service.NotificationService;
import com.fooddonation.service.UserService;
import com.fooddonation.util.FileUploadUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final DonorProfileRepository donorProfileRepository;
	private final NgoProfileRepository ngoProfileRepository;
	private final DeliveryAgentProfileRepository agentProfileRepository;
	private final FileUploadUtil fileUploadUtil;
	private final PasswordEncoder passwordEncoder;
	private final NotificationService notificationService;

	@Override
	@Transactional(readOnly = true)
	public UserResponse getCurrentUser(String email) {
		return mapToResponse(getUserByEmail(email));
	}

	@Override
	@Transactional(readOnly = true)
	public UserResponse getUserById(Long id) {
		User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
		return mapToResponse(user);
	}

	@Override
	@Transactional
	public UserResponse updateProfile(String email, Object updateRequest) {
		// Simplified — extend with a dedicated UpdateProfileRequest DTO as needed
		User user = getUserByEmail(email);
		return mapToResponse(userRepository.save(user));
	}

	@Override
	@Transactional
	public String uploadProfileImage(String email, MultipartFile file) {
		User user = getUserByEmail(email);
		String imageUrl = fileUploadUtil.uploadFile(file, "profiles/" + user.getId());
		if (user.getProfileImage() != null) {
			fileUploadUtil.deleteFile(user.getProfileImage());
		}
		user.setProfileImage(imageUrl);
		userRepository.save(user);
		return imageUrl;
	}

	@Override
	@Transactional
	public void changePassword(String email, String oldPassword, String newPassword) {
		User user = getUserByEmail(email);
		if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
			throw new BadRequestException("Current password is incorrect");
		}
		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
	}

	@Override
	@Transactional(readOnly = true)
	public PageResponse<UserResponse> getAllUsers(String role, String query, Pageable pageable) {
		Page<User> page;
		String roleName = role != null ? "ROLE_" + role.toUpperCase() : null;
		if (roleName != null && query != null && !query.isBlank()) {
			page = userRepository.searchByRole(roleName, query, pageable);
		} else if (roleName != null) {
			page = userRepository.findByRoleName(roleName, pageable);
		} else {
			page = userRepository.findAll(pageable);
		}
		return PageResponse.from(page.map(this::mapToResponse));
	}

	@Override
	@Transactional
	public void updateUserStatus(Long userId, UserStatus status) {
		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", userId));
		user.setStatus(status);
		userRepository.save(user);

		notificationService.sendNotification(user, "Account Status Updated",
				"Your account status has been changed to " + status, NotificationType.SYSTEM, userId, "USER");

		log.info("User {} status updated to {}", userId, status);
	}

	@Override
	@Transactional
	public void deleteUser(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", userId));
		userRepository.delete(user);
		log.info("User deleted: {}", userId);
	}

	@Override
	@Transactional
	public UserResponse approveNgo(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", userId));
		if (!user.isNgo()) {
			throw new BadRequestException("User is not registered as an NGO");
		}
		user.setStatus(UserStatus.ACTIVE);
		userRepository.save(user);

		ngoProfileRepository.findByUserId(userId).ifPresent(profile -> {
			profile.setVerified(true);
			ngoProfileRepository.save(profile);
		});

		notificationService.sendNotification(user, "NGO Account Approved",
				"Congratulations! Your NGO account has been verified and approved.", NotificationType.SYSTEM, userId,
				"USER");

		return mapToResponse(user);
	}

	@Override
	@Transactional
	public UserResponse approveDonor(Long userId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", userId));
		user.setStatus(UserStatus.ACTIVE);
		userRepository.save(user);

		notificationService.sendNotification(user, "Account Approved",
				"Your donor account has been approved. You can now start donating food.", NotificationType.SYSTEM,
				userId, "USER");

		return mapToResponse(user);
	}

	private UserResponse mapToResponse(User user) {
		UserResponse.UserResponseBuilder builder = UserResponse.builder().id(user.getId()).fullName(user.getFullName())
				.email(user.getEmail()).phone(user.getPhone()).profileImage(user.getProfileImage())
				.address(user.getAddress()).city(user.getCity()).state(user.getState()).pincode(user.getPincode())
				.latitude(user.getLatitude()).longitude(user.getLongitude()).status(user.getStatus().name())
				.emailVerified(user.getEmailVerified()).roles(user.getRoles().stream().map(Role::getName).toList())
				.lastLogin(user.getLastLogin()).createdAt(user.getCreatedAt());

		if (user.isDonor() && user.getDonorProfile() != null) {
			DonorProfile dp = user.getDonorProfile();
			builder.donorType(dp.getDonorType().name()).organization(dp.getOrganization())
					.totalDonated(dp.getTotalDonated()).rating(dp.getRating());
		}
		if (user.isNgo() && user.getNgoProfile() != null) {
			NgoProfile np = user.getNgoProfile();
			builder.organizationName(np.getOrganizationName()).ngoVerified(np.getVerified());
		}
		if (user.isDeliveryAgent() && user.getDeliveryAgentProfile() != null) {
			DeliveryAgentProfile ap = user.getDeliveryAgentProfile();
			builder.vehicleType(ap.getVehicleType().name()).totalDeliveries(ap.getTotalDeliveries())
					.rating(ap.getRating());
		}

		return builder.build();
	}

	private User getUserByEmail(String email) {
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
	}
}
