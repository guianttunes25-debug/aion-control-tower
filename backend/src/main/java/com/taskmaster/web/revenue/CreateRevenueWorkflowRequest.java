package com.taskmaster.web.revenue;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateRevenueWorkflowRequest(
    @NotBlank
    @Size(max = 255)
    String leadName,

    @NotBlank
    @Size(max = 255)
    String niche,

    @Size(max = 500)
    String website,

    @Size(max = 500)
    String instagram,

    @Size(max = 2000)
    String notes
) {
}