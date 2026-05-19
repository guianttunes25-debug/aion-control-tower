package com.taskmaster.web.task;

import com.taskmaster.application.task.TaskService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody CreateTaskRequest request) {
        TaskResponse response = TaskResponse.from(service.createTask(request.title(), request.description(), request.agentType()));
        return ResponseEntity.created(URI.create("/tasks/" + response.id())).body(response);
    }

    @GetMapping
    public List<TaskResponse> listTasks() {
        return service.listTasks().stream().map(TaskResponse::from).toList();
    }

    @PatchMapping("/{id}/complete")
    public TaskResponse completeTask(@PathVariable Long id) {
        return TaskResponse.from(service.completeTask(id));
    }
}