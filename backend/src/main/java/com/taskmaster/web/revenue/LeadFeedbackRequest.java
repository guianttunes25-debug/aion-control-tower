package com.taskmaster.web.revenue;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record LeadFeedbackRequest(
    @Size(max = 100)
    String objectionCategory,

    @Size(max = 2000)
    String objectionDetail,

    @Min(0)
    Integer responseLatencyMinutes,

    @Size(max = 50)
    String interestLevel,

    @Size(max = 100)
    String meetingOutcome,

    @Size(max = 50)
    String businessPainLevel,

    Boolean decisionMakerPresent,

    @Size(max = 100)
    String budgetRange,

    @Min(0)
    Integer followUpCount,

    Boolean meetingBooked,

    Boolean offerAccepted,

    @Min(0)
    BigDecimal revenueGenerated,

    @Min(0)
    BigDecimal monthlyRecurringRevenue,

    @Size(max = 2000)
    String notes
) {
}