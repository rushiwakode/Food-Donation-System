package com.fooddonation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fooddonation.enums.UserStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users", uniqueConstraints = {
		@UniqueConstraint(name = "uk_users_email", columnNames = "email") }, indexes = {
				@Index(name = "idx_users_email", columnList = "email"),
				@Index(name = "idx_users_city", columnList = "city"),
				@Index(name = "idx_users_status", columnList = "status") })
public class User extends BaseEntity implements UserDetails {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "full_name", nullable = false, length = 100)
	private String fullName;

	@Column(nullable = false, unique = true, length = 150)
	private String email;

	@Column(length = 15)
	private String phone;

	@Column(nullable = false, length = 255)
	private String password;

	@Column(name = "profile_image", length = 500)
	private String profileImage;

	@Column(columnDefinition = "TEXT")
	private String address;

	@Column(length = 100)
	private String city;

	@Column(length = 100)
	private String state;

	@Column(length = 10)
	private String pincode;

	@Column(precision = 10, scale = 8)
	private BigDecimal latitude;

	@Column(precision = 11, scale = 8)
	private BigDecimal longitude;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	@Builder.Default
	private UserStatus status = UserStatus.PENDING;

	@Column(name = "email_verified")
	@Builder.Default
	private Boolean emailVerified = false;

	@Column(name = "phone_verified")
	@Builder.Default
	private Boolean phoneVerified = false;

	@Column(name = "email_verify_token", length = 255)
	private String emailVerifyToken;

	@Column(name = "password_reset_token", length = 255)
	private String passwordResetToken;

	@Column(name = "password_reset_expiry")
	private LocalDateTime passwordResetExpiry;

	@Column(name = "last_login")
	private LocalDateTime lastLogin;

	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
	@Builder.Default
	private Set<Role> roles = new HashSet<>();

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private DonorProfile donorProfile;

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private NgoProfile ngoProfile;

	@OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private DeliveryAgentProfile deliveryAgentProfile;

	@OneToMany(mappedBy = "donor", fetch = FetchType.LAZY)
	@Builder.Default
	private List<FoodDonation> donations = new ArrayList<>();

	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	@Builder.Default
	private List<Notification> notifications = new ArrayList<>();

	// ===== Spring Security Methods =====

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return roles.stream().map(role -> new SimpleGrantedAuthority(role.getName())).collect(Collectors.toSet());
	}

	@Override
	public String getUsername() {
		return email;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return status != UserStatus.BLOCKED;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return status == UserStatus.ACTIVE;
	}

	// ===== Helper Methods =====

	public boolean hasRole(String roleName) {
		return roles.stream().anyMatch(r -> r.getName().equals(roleName));
	}

	public boolean isAdmin() {
		return hasRole(Role.ADMIN);
	}

	public boolean isDonor() {
		return hasRole(Role.DONOR);
	}

	public boolean isNgo() {
		return hasRole(Role.NGO);
	}

	public boolean isDeliveryAgent() {
		return hasRole(Role.DELIVERY_AGENT);
	}

}
