package com.taskmaster.web.revenue;

import jakarta.validation.constraints.Size;

public record LeadScoreRequest(
    Boolean instagramAbandoned,
    Boolean familyBusiness,
    Boolean noPromotions,
    Boolean competitiveNeighborhood,

    @Size(max = 2000)
    String scoreNotes
) {
}