package com.fooddonation.entity;

import java.time.LocalDateTime;

import com.fooddonation.enums.ReportStatus;
import com.fooddonation.enums.ReportType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "reports")
public class Report {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "generated_by", nullable = false)
	private User generatedBy;

	@Enumerated(EnumType.STRING)
	@Column(name = "report_type", nullable = false, length = 20)
	private ReportType reportType;

	@Column(nullable = false, length = 250)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String parameters;

	@Column(name = "file_path", length = 500)
	private String filePath;

	@Enumerated(EnumType.STRING)
	@Column(length = 15)
	@Builder.Default
	private ReportStatus status = ReportStatus.PENDING;

	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "completed_at")
	private LocalDateTime completedAt;

	@PrePersist
	protected void onCreate() {
		createdAt = LocalDateTime.now();
	}

}
