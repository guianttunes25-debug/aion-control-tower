package com.taskmaster.web.browser;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ObserveBrowserPageRequest(
    @NotBlank String url,
    String title,
    List<String> headings,
    @Min(0) int clickables,
    List<String> actionLabels
) {
}