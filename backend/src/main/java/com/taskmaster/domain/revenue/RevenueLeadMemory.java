package com.taskmaster.domain.revenue;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "revenue_lead_memory")
public class RevenueLeadMemory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String leadName;

    @Column(nullable = false)
    private String niche;

    @Column(nullable = false)
    private String productOffer;

    @Column(nullable = false)
    private String targetMonthlyPrice;

    private String website;

    private String instagram;

    @Column(length = 2000)
    private String objections;

    @Column(length = 2000)
    private String competitors;

    @Column(length = 2000)
    private String campaignHistory;

    @Column(length = 2000)
    private String behaviorNotes;

    private String objectionCategory;

    private Integer responseLatencyMinutes;

    private String interestLevel;

    private String meetingOutcome;

    private String businessPainLevel;

    private Boolean decisionMakerPresent;

    private String budgetRange;

    @Column(nullable = false)
    private int followUpCount;

    @Column(nullable = false)
    private int leadScore;

    private Boolean instagramAbandoned;

    private Boolean familyBusiness;

    private Boolean noPromotions;

    private Boolean competitiveNeighborhood;

    @Column(length = 2000)
    private String scoreNotes;

    @Column(nullable = false)
    private BigDecimal revenueGenerated = BigDecimal.ZERO;

    @Column(nullable = false)
    private int meetingsBooked;

    @Column(nullable = false)
    private int offersAccepted;

    @Column(nullable = false)
    private BigDecimal monthlyRecurringRevenue = BigDecimal.ZERO;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected RevenueLeadMemory() {
    }

    public RevenueLeadMemory(String leadName, String niche, String productOffer, String targetMonthlyPrice) {
        this.leadName = leadName;
        this.niche = niche;
        this.productOffer = productOffer;
        this.targetMonthlyPrice = targetMonthlyPrice;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void captureLeadContext(String niche, String website, String instagram, String notes) {
        if (niche != null && !niche.isBlank()) {
            this.niche = niche;
        }
        this.website = website;
        this.instagram = instagram;
        if (notes != null && !notes.isBlank()) {
            this.behaviorNotes = append(this.behaviorNotes, notes);
        }
    }

    public void captureFeedback(
        String objectionCategory,
        String objectionDetail,
        Integer responseLatencyMinutes,
        String interestLevel,
        String meetingOutcome,
        String businessPainLevel,
        Boolean decisionMakerPresent,
        String budgetRange,
        Integer followUpCount,
        Boolean meetingBooked,
        Boolean offerAccepted,
        BigDecimal revenueGenerated,
        BigDecimal monthlyRecurringRevenue,
        String notes
    ) {
        this.objectionCategory = choose(objectionCategory, this.objectionCategory);
        this.responseLatencyMinutes = responseLatencyMinutes == null ? this.responseLatencyMinutes : responseLatencyMinutes;
        this.interestLevel = choose(interestLevel, this.interestLevel);
        this.meetingOutcome = choose(meetingOutcome, this.meetingOutcome);
        this.businessPainLevel = choose(businessPainLevel, this.businessPainLevel);
        this.decisionMakerPresent = decisionMakerPresent == null ? this.decisionMakerPresent : decisionMakerPresent;
        this.budgetRange = choose(budgetRange, this.budgetRange);
        this.followUpCount = followUpCount == null ? this.followUpCount + 1 : followUpCount;

        if (objectionDetail != null && !objectionDetail.isBlank()) {
            this.objections = append(this.objections, objectionDetail);
        }
        if (notes != null && !notes.isBlank()) {
            this.behaviorNotes = append(this.behaviorNotes, notes);
        }
        if (Boolean.TRUE.equals(meetingBooked)) {
            this.meetingsBooked++;
        }
        if (Boolean.TRUE.equals(offerAccepted)) {
            this.offersAccepted++;
        }
        if (revenueGenerated != null) {
            this.revenueGenerated = revenueGenerated;
        }
        if (monthlyRecurringRevenue != null) {
            this.monthlyRecurringRevenue = monthlyRecurringRevenue;
        }
    }

    public void scoreManually(
        Boolean instagramAbandoned,
        Boolean familyBusiness,
        Boolean noPromotions,
        Boolean competitiveNeighborhood,
        String scoreNotes
    ) {
        this.instagramAbandoned = instagramAbandoned == null ? this.instagramAbandoned : instagramAbandoned;
        this.familyBusiness = familyBusiness == null ? this.familyBusiness : familyBusiness;
        this.noPromotions = noPromotions == null ? this.noPromotions : noPromotions;
        this.competitiveNeighborhood = competitiveNeighborhood == null ? this.competitiveNeighborhood : competitiveNeighborhood;
        if (scoreNotes != null && !scoreNotes.isBlank()) {
            this.scoreNotes = append(this.scoreNotes, scoreNotes);
        }
        this.leadScore = calculateLeadScore();
    }

    private int calculateLeadScore() {
        int score = 0;
        if (Boolean.TRUE.equals(instagramAbandoned)) {
            score += 2;
        }
        if (Boolean.TRUE.equals(familyBusiness)) {
            score += 2;
        }
        if (Boolean.TRUE.equals(noPromotions)) {
            score += 3;
        }
        if (Boolean.TRUE.equals(competitiveNeighborhood)) {
            score += 2;
        }
        return score;
    }

    private String append(String current, String value) {
        return current == null || current.isBlank() ? value : current + "\n" + value;
    }

    private String choose(String next, String current) {
        return next == null || next.isBlank() ? current : next;
    }

    public Long getId() {
        return id;
    }

    public String getLeadName() {
        return leadName;
    }

    public String getNiche() {
        return niche;
    }

    public String getProductOffer() {
        return productOffer;
    }

    public String getTargetMonthlyPrice() {
        return targetMonthlyPrice;
    }

    public String getWebsite() {
        return website;
    }

    public String getInstagram() {
        return instagram;
    }

    public String getObjections() {
        return objections;
    }

    public String getCompetitors() {
        return competitors;
    }

    public String getCampaignHistory() {
        return campaignHistory;
    }

    public String getBehaviorNotes() {
        return behaviorNotes;
    }

    public String getObjectionCategory() {
        return objectionCategory;
    }

    public Integer getResponseLatencyMinutes() {
        return responseLatencyMinutes;
    }

    public String getInterestLevel() {
        return interestLevel;
    }

    public String getMeetingOutcome() {
        return meetingOutcome;
    }

    public String getBusinessPainLevel() {
        return businessPainLevel;
    }

    public Boolean getDecisionMakerPresent() {
        return decisionMakerPresent;
    }

    public String getBudgetRange() {
        return budgetRange;
    }

    public int getFollowUpCount() {
        return followUpCount;
    }

    public int getLeadScore() {
        return leadScore;
    }

    public Boolean getInstagramAbandoned() {
        return instagramAbandoned;
    }

    public Boolean getFamilyBusiness() {
        return familyBusiness;
    }

    public Boolean getNoPromotions() {
        return noPromotions;
    }

    public Boolean getCompetitiveNeighborhood() {
        return competitiveNeighborhood;
    }

    public String getScoreNotes() {
        return scoreNotes;
    }

    public BigDecimal getRevenueGenerated() {
        return revenueGenerated;
    }

    public int getMeetingsBooked() {
        return meetingsBooked;
    }

    public int getOffersAccepted() {
        return offersAccepted;
    }

    public BigDecimal getMonthlyRecurringRevenue() {
        return monthlyRecurringRevenue;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}