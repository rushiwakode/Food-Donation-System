package com.fooddonation.controller;

import com.fooddonation.dto.response.ApiResponse;
import com.fooddonation.entity.FoodCategory;
import com.fooddonation.exception.ResourceNotFoundException;
import com.fooddonation.repository.FoodCategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Food Categories", description = "Food category management")
public class CategoryController {

	private final FoodCategoryRepository categoryRepository;

	@GetMapping
	@Operation(summary = "Get all active food categories")
	public ResponseEntity<ApiResponse<List<FoodCategory>>> getAllCategories() {
		return ResponseEntity.ok(ApiResponse.success(categoryRepository.findByIsActiveTrue()));
	}

	@PostMapping("/admin")
	@Operation(summary = "Create a new food category (Admin only)")
	public ResponseEntity<ApiResponse<FoodCategory>> createCategory(@RequestBody Map<String, String> body) {
		FoodCategory category = FoodCategory.builder().name(body.get("name")).description(body.get("description"))
				.icon(body.get("icon")).isActive(true).build();
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Category created", categoryRepository.save(category)));
	}

	@PutMapping("/admin/{id}")
	@Operation(summary = "Update a food category (Admin only)")
	public ResponseEntity<ApiResponse<FoodCategory>> updateCategory(@PathVariable Long id,
			@RequestBody Map<String, String> body) {
		FoodCategory category = categoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Category", id));
		if (body.containsKey("name"))
			category.setName(body.get("name"));
		if (body.containsKey("description"))
			category.setDescription(body.get("description"));
		if (body.containsKey("icon"))
			category.setIcon(body.get("icon"));
		return ResponseEntity.ok(ApiResponse.success("Category updated", categoryRepository.save(category)));
	}

	@DeleteMapping("/admin/{id}")
	@Operation(summary = "Deactivate a food category (Admin only)")
	public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
		FoodCategory category = categoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Category", id));
		category.setIsActive(false);
		categoryRepository.save(category);
		return ResponseEntity.ok(ApiResponse.success("Category deactivated", null));
	}
}
