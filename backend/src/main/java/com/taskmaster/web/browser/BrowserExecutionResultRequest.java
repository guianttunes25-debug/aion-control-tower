package com.taskmaster.web.browser;

import jakarta.validation.constraints.NotBlank;

public record BrowserExecutionResultRequest(
    @NotBlank String result
) {
}