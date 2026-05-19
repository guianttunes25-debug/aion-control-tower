package com.taskmaster.bootstrap;

import com.taskmaster.persistence.SystemCheckpoint;
import com.taskmaster.persistence.SystemCheckpointRepository;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class PersistenceValidationRunner implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(PersistenceValidationRunner.class);

    private final SystemCheckpointRepository repository;

    public PersistenceValidationRunner(SystemCheckpointRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(ApplicationArguments args) {
        SystemCheckpoint checkpoint = repository.save(new SystemCheckpoint("backend-bootstrap", Instant.now()));
        logger.info("Persistence validation checkpoint inserted with id={}", checkpoint.getId());
    }
}