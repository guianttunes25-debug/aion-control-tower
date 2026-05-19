package com.taskmaster;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class TaskmasterApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskmasterApplication.class, args);
    }
}