package com.taskmaster.application.task;

import com.taskmaster.domain.agent.AgentType;
import com.taskmaster.domain.task.Task;
import com.taskmaster.infrastructure.task.TaskRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Task createTask(String title, String description) {
        return createTask(title, description, AgentType.CODE);
    }

    @Transactional
    public Task createTask(String title, String description, AgentType agentType) {
        return repository.save(new Task(title, description, agentType));
    }

    @Transactional(readOnly = true)
    public List<Task> listTasks() {
        return repository.findAll();
    }

    @Transactional
    public Task completeTask(Long id) {
        Task task = repository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
        task.complete();
        return task;
    }
}