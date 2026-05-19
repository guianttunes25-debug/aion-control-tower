package com.taskmaster.web.task;

import com.taskmaster.domain.agent.AgentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTaskRequest(
	@NotNull
	@NotBlank
	@Size(max = 255)
	String title,

	@Size(max = 2000)
	String description,

	AgentType agentType
) {
}