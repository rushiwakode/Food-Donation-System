package com.fooddonation.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fooddonation.dto.request.ContactReplyRequest;
import com.fooddonation.dto.request.ContactRequest;
import com.fooddonation.dto.response.ApiResponse;
import com.fooddonation.dto.response.PageResponse;
import com.fooddonation.entity.ContactMessage;
import com.fooddonation.enums.ContactStatus;
import com.fooddonation.exception.ResourceNotFoundException;
import com.fooddonation.repository.ContactMessageRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/public/contact")
@RequiredArgsConstructor
@Tag(name = "Contact", description = "Public contact form submission")
public class ContactController {

	private final ContactMessageRepository contactMessageRepository;

	@PostMapping
	@Operation(summary = "Submit a contact form message")
	public ResponseEntity<ApiResponse<Void>> submitMessage(@Valid @RequestBody ContactRequest request) {
		ContactMessage message = ContactMessage.builder().name(request.getName()).email(request.getEmail())
				.phone(request.getPhone()).subject(request.getSubject()).message(request.getMessage())
				.status(ContactStatus.UNREAD).build();
		contactMessageRepository.save(message);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Thank you for reaching out! We'll get back to you soon.", null));
	}

	@GetMapping("/admin")
	@Operation(summary = "Get all contact messages (Admin only)")
	public ResponseEntity<ApiResponse<PageResponse<ContactMessage>>> getAllMessages(
			@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		Page<ContactMessage> result = contactMessageRepository.findAll(pageable);
		return ResponseEntity.ok(ApiResponse.success(PageResponse.from(result)));
	}

	@PutMapping("/admin/{id}/reply")
	@Operation(summary = "Mark a message as replied with notes")
	public ResponseEntity<ApiResponse<Void>> replyToMessage(@PathVariable Long id,
			@RequestBody ContactReplyRequest request) {
		ContactMessage message = contactMessageRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Contact message", id));
		message.setStatus(ContactStatus.REPLIED);
		message.setReplyNote(request.getReplyNote());
		contactMessageRepository.save(message);
		return ResponseEntity.ok(ApiResponse.success("Message marked as replied", null));
	}

}
