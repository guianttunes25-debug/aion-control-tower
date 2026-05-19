package com.taskmaster.infrastructure.runtime;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AionRuntimeExecutorConfig {

    @Bean(destroyMethod = "close")
    public ExecutorService aionRuntimeExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}