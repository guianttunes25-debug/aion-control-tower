package com.taskmaster.web.runtime;

import com.taskmaster.domain.agent.AgentStatus;
import com.taskmaster.domain.task.TaskStatus;
import com.taskmaster.infrastructure.agent.AgentRepository;
import com.taskmaster.infrastructure.agent.RuntimeEventRepository;
import com.taskmaster.infrastructure.task.TaskRepository;
import com.taskmaster.web.task.TaskResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/runtime")
public class RuntimeController {

    private final RuntimeEventRepository eventRepository;
    private final AgentRepository agentRepository;
    private final TaskRepository taskRepository;

    public RuntimeController(
        RuntimeEventRepository eventRepository,
        AgentRepository agentRepository,
        TaskRepository taskRepository
    ) {
        this.eventRepository = eventRepository;
        this.agentRepository = agentRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping("/events")
    public List<RuntimeEventResponse> events() {
        return eventRepository.findTop50ByOrderByTimestampDesc().stream()
            .map(RuntimeEventResponse::from)
            .toList();
    }

    @GetMapping("/agents")
    public List<AgentRuntimeResponse> agents() {
        return agentRepository.findAll().stream()
            .map(AgentRuntimeResponse::from)
            .toList();
    }

    @GetMapping("/tasks/running")
    public List<TaskResponse> runningTasks() {
        return taskRepository.findByStatusIn(List.of(TaskStatus.RUNNING, TaskStatus.RETRYING)).stream()
            .map(TaskResponse::from)
            .toList();
    }

    @GetMapping("/metrics")
    public RuntimeMetricsResponse metrics() {
        return new RuntimeMetricsResponse(
            taskRepository.countByStatus(TaskStatus.COMPLETED),
            taskRepository.countByStatus(TaskStatus.FAILED),
            taskRepository.averageExecutionSeconds(),
            agentRepository.countByStatus(AgentStatus.AVAILABLE) + agentRepository.countByStatus(AgentStatus.BUSY)
        );
    }
}