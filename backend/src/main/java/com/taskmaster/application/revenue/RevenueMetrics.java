package com.taskmaster.application.revenue;

import com.taskmaster.domain.revenue.RevenueLeadMemory;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public record RevenueMetrics(
    BigDecimal revenueGenerated,
    int meetingsBooked,
    int offersAccepted,
    double conversionRate,
    BigDecimal monthlyRecurringRevenue,
    int leadCount
) {

    public static RevenueMetrics from(List<RevenueLeadMemory> memories) {
        BigDecimal revenueGenerated = BigDecimal.ZERO;
        BigDecimal monthlyRecurringRevenue = BigDecimal.ZERO;
        int meetingsBooked = 0;
        int offersAccepted = 0;

        for (RevenueLeadMemory memory : memories) {
            revenueGenerated = revenueGenerated.add(memory.getRevenueGenerated());
            monthlyRecurringRevenue = monthlyRecurringRevenue.add(memory.getMonthlyRecurringRevenue());
            meetingsBooked += memory.getMeetingsBooked();
            offersAccepted += memory.getOffersAccepted();
        }

        double conversionRate = memories.isEmpty() ? 0 : BigDecimal.valueOf(offersAccepted)
            .divide(BigDecimal.valueOf(memories.size()), 4, RoundingMode.HALF_UP)
            .doubleValue();

        return new RevenueMetrics(revenueGenerated, meetingsBooked, offersAccepted, conversionRate, monthlyRecurringRevenue, memories.size());
    }
}