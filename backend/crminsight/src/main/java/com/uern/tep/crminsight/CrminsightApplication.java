package com.uern.tep.crminsight;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CrminsightApplication {

	public static void main(String[] args) {
		System.out.println("JWT_SECRET from env: " + System.getenv("JWT_SECRET"));
		SpringApplication.run(CrminsightApplication.class, args);
	}

}
