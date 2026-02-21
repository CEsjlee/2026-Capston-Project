package org.tukorea.com.grad.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GradBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(GradBackendApplication.class, args);
	}

}
