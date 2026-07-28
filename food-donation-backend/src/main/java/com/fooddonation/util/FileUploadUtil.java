package com.fooddonation.util;

import com.fooddonation.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
public class FileUploadUtil {

	@Value("${app.upload.dir:uploads}")
	private String uploadDir;

	@Value("${app.upload.max-size:5242880}")
	private long maxSize;

	private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp", "image/gif");

	public String uploadFile(MultipartFile file, String subDir) {
		validateFile(file);
		try {
			String extension = getExtension(file.getOriginalFilename());
			String filename = UUID.randomUUID() + "." + extension;
			Path uploadPath = Paths.get(uploadDir, subDir);
			Files.createDirectories(uploadPath);
			Path filePath = uploadPath.resolve(filename);
			Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
			return "/" + uploadDir + "/" + subDir + "/" + filename;
		} catch (IOException e) {
			log.error("Failed to upload file: {}", e.getMessage());
			throw new BadRequestException("Failed to upload file. Please try again.");
		}
	}

	public void deleteFile(String filePath) {
		if (filePath == null)
			return;
		try {
			Path path = Paths.get(filePath.startsWith("/") ? filePath.substring(1) : filePath);
			Files.deleteIfExists(path);
		} catch (IOException e) {
			log.warn("Failed to delete file: {}", filePath);
		}
	}

	private void validateFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new BadRequestException("File is empty");
		}
		if (file.getSize() > maxSize) {
			throw new BadRequestException("File size exceeds maximum allowed 5MB");
		}
		String contentType = file.getContentType();
		if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
			throw new BadRequestException("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
		}
	}

	private String getExtension(String filename) {
		if (filename == null || !filename.contains("."))
			return "jpg";
		return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
	}
}
