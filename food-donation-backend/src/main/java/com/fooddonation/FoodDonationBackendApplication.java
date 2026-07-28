package com.fooddonation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@EnableAsync
@EnableScheduling
@SpringBootApplication
public class FoodDonationBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(FoodDonationBackendApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void onApplicationReady() {
		log.info("╔══════════════════════════════════════════════════════╗");
		log.info("║    Food Donation Management System v1.0.0            ║");
		log.info("║    API  →  http://localhost:8080/api                 ║");
		log.info("║    Docs →  http://localhost:8080/api/swagger-ui.html ║");
		log.info("╚══════════════════════════════════════════════════════╝");
	}

}
