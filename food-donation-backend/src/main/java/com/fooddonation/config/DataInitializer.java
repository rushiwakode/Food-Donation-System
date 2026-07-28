package com.fooddonation.config;

import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fooddonation.entity.DonorProfile;
import com.fooddonation.entity.NgoProfile;
import com.fooddonation.entity.Role;
import com.fooddonation.entity.User;
import com.fooddonation.enums.DonorType;
import com.fooddonation.enums.UserStatus;
import com.fooddonation.repository.DonorProfileRepository;
import com.fooddonation.repository.FoodCategoryRepository;
import com.fooddonation.repository.NgoProfileRepository;
import com.fooddonation.repository.RoleRepository;
import com.fooddonation.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

	private final RoleRepository roleRepository;
	private final UserRepository userRepository;
	private final FoodCategoryRepository categoryRepository;
	private final DonorProfileRepository donorProfileRepository;
	private final NgoProfileRepository ngoProfileRepository;
	private final PasswordEncoder passwordEncoder;

	@Override
	@Transactional
	public void run(String... args) {
		seedRoles();
		seedCategories();
		seedAdminUser();
		seedSampleUsers();
		log.info("✅ Data initialisation complete");
	}

	// Roles
	private void seedRoles() {
		createRoleIfMissing(Role.ADMIN, "System Administrator with full access");
		createRoleIfMissing(Role.DONOR, "Food donor - restaurants, caterers, individuals");
		createRoleIfMissing(Role.NGO, "NGO that claims and distributes donated food");
		createRoleIfMissing(Role.DELIVERY_AGENT, "Volunteer delivery agent");
	}

	private void createRoleIfMissing(String name, String description) {
		if (!roleRepository.existsByName(name)) {
			roleRepository.save(Role.builder().name(name).description(description).build());
			log.info("Role created: {}", name);
		}
	}

	// Food Categories
	private void seedCategories() {
		String[][] cats = { { "Cooked Meals", "Freshly cooked meals ready to eat", "utensils" },
				{ "Backery & Bread", "Bread, Pastries, and baked goods", "bread-slice" },
				{ "Fruits & Vegetables", "Fresh produce and vegetables", "apple-alt" },
				{ "Dairy Products", "Milk, cheese, yogurt, and related items", "cheese" },
				{ "Rice & Grains", "Rice, wheat, pulses, and cereals", "seedling" },
				{ "Snacks & Beverages", "Packaged snacks and drinks", "cookie" },
				{ "Desserts & Sweets", "Cakes, sweets, and desserts", "birthday-cake" },
				{ "Packed Food", "Sealed and packaged food items", "box" },
				{ "Beverages", "Juices, water, and drinks", "glass-water" },
				{ "Other", "Other food items not listed above", "ellipsis" }, };

		for (String[] c : cats) {
			if (!categoryRepository.existsByName(c[0])) {
				categoryRepository.save(com.fooddonation.entity.FoodCategory.builder().name(c[0]).description(c[1])
						.icon(c[2]).isActive(true).build());
			}
		}
		log.info("  Food categories seeded");
	}

	// ADMIN USER
	private void seedAdminUser() {
		String email = "admin@fooddonation.com";
		if (userRepository.existsByEmail(email))
			return;

		Role adminRole = roleRepository.findByName(Role.ADMIN).orElseThrow();
		User admin = User.builder().fullName("System Administrator").email(email).phone("9999999999")
				.password(passwordEncoder.encode("Admin@123")).status(UserStatus.ACTIVE).emailVerified(true)
				.city("Mumbai").state("Maharashtra").roles(Set.of(adminRole)).build();
		userRepository.save(admin);
		log.info("  Admin user created  →  admin@fooddonation.com / Admin@123");
	}

	// SAMPLE USERS (DONOR + NGO)
	private void seedSampleUsers() {
		seedDonor();
		seedNgo();
	}

	private void seedDonor() {
		String email = "sharma.restaurant@gmail.com";
		if (userRepository.existsByEmail(email))
			return;

		Role donorRole = roleRepository.findByName(Role.DONOR).orElseThrow();
		User donor = User.builder().fullName("Sharma Restaurant").email(email).phone("9876543210")
				.password(passwordEncoder.encode("Donor@123")).status(UserStatus.ACTIVE).emailVerified(true)
				.city("Pune").state("Maharashtra").address("MG Road, Camp Area").pincode("411001")
				.roles(Set.of(donorRole)).build();
		User saved = userRepository.save(donor);

		donorProfileRepository.save(DonorProfile.builder().user(saved).donorType(DonorType.RESTAURANT)
				.organization("Sharma Restaurant").fssaiNumber("FSSAI12345678").build());
		log.info("  Sample Donor created  →  {} / Donor@123", email);
	}

	private void seedNgo() {
		String email = "helpinghands@ngo.org";
		if (userRepository.existsByEmail(email))
			return;

		Role ngoRole = roleRepository.findByName(Role.NGO).orElseThrow();
		User ngo = User.builder().fullName("Helping Hands NGO").email(email).phone("9123456780")
				.password(passwordEncoder.encode("NGO@12345")).status(UserStatus.ACTIVE).emailVerified(true)
				.city("Pune").state("Maharashtra").address("Koregaon Park, Pune").roles(Set.of(ngoRole)).build();
		User saved = userRepository.save(ngo);

		ngoProfileRepository.save(NgoProfile.builder().user(saved).organizationName("Helping Hands Foundation")
				.registrationNumber("NGO/MH/2018/123456")
				.description("We work to feed the underprivileged in Pune city").foodCapacity(500)
				.serviceArea("Pune,Pimpri-Chinchwad").verified(true).build());
		log.info("  Sample NGO created    →  {} / NGO@12345", email);
	}

}
