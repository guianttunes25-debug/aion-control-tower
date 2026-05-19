package com.taskmaster.web.browser;

import jakarta.validation.constraints.NotBlank;

public record CreateBrowserAutopilotSessionRequest(
    @NotBlank String goal,
    @NotBlank String startUrl
) {
}