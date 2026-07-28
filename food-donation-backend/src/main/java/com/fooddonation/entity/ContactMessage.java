package com.fooddonation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.fooddonation.enums.ContactStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "contact_messages")
public class ContactMessage {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 100)
	private String name;
	@Column(nullable = false, length = 150)
	private String email;
	@Column(length = 15)
	private String phone;
	@Column(nullable = false, length = 255)
	private String subject;
	@Column(nullable = false, columnDefinition = "TEXT")
	private String message;

	@Enumerated(EnumType.STRING)
	@Column(length = 10)
	@Builder.Default
	private ContactStatus status = ContactStatus.UNREAD;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "replied_by")
	private User repliedBy;

	@Column(name = "replied_at")
	private LocalDateTime repliedAt;
	@Column(name = "reply_note", columnDefinition = "TEXT")
	private String replyNote;
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}

}
