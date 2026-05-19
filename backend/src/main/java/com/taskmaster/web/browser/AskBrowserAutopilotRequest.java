package com.taskmaster.web.browser;

import jakarta.validation.constraints.NotBlank;

public record AskBrowserAutopilotRequest(
    @NotBlank String question
) {
}