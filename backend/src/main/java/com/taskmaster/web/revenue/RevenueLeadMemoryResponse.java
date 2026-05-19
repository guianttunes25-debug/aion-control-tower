package com.taskmaster.web.revenue;

import com.taskmaster.domain.revenue.RevenueLeadMemory;
import java.math.BigDecimal;
import java.time.Instant;

public record RevenueLeadMemoryResponse(
    Long id,
    String leadName,
    String niche,
    String productOffer,
    String targetMonthlyPrice,
    String website,
    String instagram,
    String objections,
    String competitors,
    String campaignHistory,
    String behaviorNotes,
    String objectionCategory,
    Integer responseLatencyMinutes,
    String interestLevel,
    String meetingOutcome,
    String businessPainLevel,
    Boolean decisionMakerPresent,
    String budgetRange,
    int followUpCount,
    int leadScore,
    Boolean instagramAbandoned,
    Boolean familyBusiness,
    Boolean noPromotions,
    Boolean competitiveNeighborhood,
    String scoreNotes,
    BigDecimal revenueGenerated,
    int meetingsBooked,
    int offersAccepted,
    BigDecimal monthlyRecurringRevenue,
    Instant updatedAt
) {

    public static RevenueLeadMemoryResponse from(RevenueLeadMemory memory) {
        if (memory == null) {
            return null;
        }
        return new RevenueLeadMemoryResponse(
            memory.getId(),
            memory.getLeadName(),
            memory.getNiche(),
            memory.getProductOffer(),
            memory.getTargetMonthlyPrice(),
            memory.getWebsite(),
            memory.getInstagram(),
            memory.getObjections(),
            memory.getCompetitors(),
            memory.getCampaignHistory(),
            memory.getBehaviorNotes(),
            memory.getObjectionCategory(),
            memory.getResponseLatencyMinutes(),
            memory.getInterestLevel(),
            memory.getMeetingOutcome(),
            memory.getBusinessPainLevel(),
            memory.getDecisionMakerPresent(),
            memory.getBudgetRange(),
            memory.getFollowUpCount(),
            memory.getLeadScore(),
            memory.getInstagramAbandoned(),
            memory.getFamilyBusiness(),
            memory.getNoPromotions(),
            memory.getCompetitiveNeighborhood(),
            memory.getScoreNotes(),
            memory.getRevenueGenerated(),
            memory.getMeetingsBooked(),
            memory.getOffersAccepted(),
            memory.getMonthlyRecurringRevenue(),
            memory.getUpdatedAt()
        );
    }
}