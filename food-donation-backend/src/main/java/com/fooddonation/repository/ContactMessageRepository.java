package com.fooddonation.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fooddonation.entity.ContactMessage;
import com.fooddonation.enums.ContactStatus;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

	Page<ContactMessage> findByStatus(ContactStatus status, Pageable pageable);

	long countByStatus(ContactStatus status);

}
