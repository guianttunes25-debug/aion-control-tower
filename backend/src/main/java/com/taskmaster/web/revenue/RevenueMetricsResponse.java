package com.taskmaster.web.revenue;

import com.taskmaster.application.revenue.RevenueMetrics;
import java.math.BigDecimal;

public record RevenueMetricsResponse(
    BigDecimal revenueGenerated,
    int meetingsBooked,
    int offersAccepted,
    double conversionRate,
    BigDecimal monthlyRecurringRevenue,
    int leadCount
) {

    public static RevenueMetricsResponse from(RevenueMetrics metrics) {
        return new RevenueMetricsResponse(
            metrics.revenueGenerated(),
            metrics.meetingsBooked(),
            metrics.offersAccepted(),
            metrics.conversionRate(),
            metrics.monthlyRecurringRevenue(),
            metrics.leadCount()
        );
    }
}