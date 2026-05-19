package com.taskmaster.application.revenue;

import com.taskmaster.domain.agent.AgentType;
import com.taskmaster.domain.revenue.RevenueLeadMemory;
import com.taskmaster.domain.task.Task;
import com.taskmaster.infrastructure.revenue.RevenueLeadMemoryRepository;
import com.taskmaster.infrastructure.task.TaskRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RevenueWorkflowService {

    private static final String PRODUCT_OFFER = "Aion Local Growth";
    private static final String TARGET_NICHE = "mercados pequenos e medios";
    private static final String TARGET_PRICE = "R$197-R$297/mes";

    private final TaskRepository taskRepository;
    private final RevenueLeadMemoryRepository memoryRepository;

    public RevenueWorkflowService(TaskRepository taskRepository, RevenueLeadMemoryRepository memoryRepository) {
        this.taskRepository = taskRepository;
        this.memoryRepository = memoryRepository;
    }

    @Transactional
    public RevenueWorkflow createLocalGrowthWorkflow(String leadName, String niche, String website, String instagram, String notes) {
        String workflowId = "REV-" + UUID.randomUUID();
        RevenueLeadMemory memory = memoryRepository.findByLeadName(leadName)
            .orElseGet(() -> memoryRepository.save(new RevenueLeadMemory(leadName, TARGET_NICHE, PRODUCT_OFFER, TARGET_PRICE)));
        memory.captureLeadContext(niche, website, instagram, notes);
        String context = buildContext(memory, website, instagram, notes);

        Task leadResearch = saveStep(workflowId, 1, null, AgentType.LEAD_RESEARCH, "Lead research: " + leadName, context + "\nAnalyze public presence and detect pains.");
        Task score = saveStep(workflowId, 2, leadResearch.getId(), AgentType.OPPORTUNITY_SCORE, "Opportunity score: " + leadName, context + "\nScore urgency, fit, and likely value.");
        Task offer = saveStep(workflowId, 3, score.getId(), AgentType.OFFER_GENERATION, "Offer generation: " + leadName, context + "\nGenerate a niche-specific commercial offer.");
        Task outreach = saveStep(workflowId, 4, offer.getId(), AgentType.OUTREACH, "Outreach draft: " + leadName, context + "\nPrepare the first semi-personalized contact.");
        Task reply = saveStep(workflowId, 5, outreach.getId(), AgentType.REPLY_ANALYSIS, "Reply analysis: " + leadName, context + "\nAnalyze response intent when a reply is registered.");
        Task approval = saveStep(workflowId, 6, reply.getId(), AgentType.HUMAN_APPROVAL, "Human approval: " + leadName, context + "\nHuman must approve next sales action. CloseDeal is intentionally manual in this phase.");
        approval.waitForHumanApproval();

        return new RevenueWorkflow(workflowId, leadName, memory.getNiche(), memory, taskRepository.findByWorkflowIdOrderByWorkflowStepAsc(workflowId));
    }

    @Transactional(readOnly = true)
    public RevenueWorkflow getWorkflow(String workflowId) {
        List<Task> tasks = taskRepository.findByWorkflowIdOrderByWorkflowStepAsc(workflowId);
        String leadName = tasks.isEmpty() ? null : extractLeadName(tasks.get(0).getTitle());
        RevenueLeadMemory memory = leadName == null ? null : memoryRepository.findByLeadName(leadName).orElse(null);
        String niche = memory == null ? null : memory.getNiche();
        return new RevenueWorkflow(workflowId, leadName, niche, memory, tasks);
    }

    @Transactional(readOnly = true)
    public List<RevenueLeadMemory> listLeadMemories() {
        return memoryRepository.findAllByOrderByUpdatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<RevenueLeadMemory> listPrioritizedLeadMemories() {
        return memoryRepository.findAllByOrderByLeadScoreDescUpdatedAtDesc();
    }

    @Transactional(readOnly = true)
    public RevenueMetrics metrics() {
        List<RevenueLeadMemory> memories = memoryRepository.findAll();
        return RevenueMetrics.from(memories);
    }

    @Transactional
    public RevenueLeadMemory captureLeadFeedback(
        Long leadMemoryId,
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
        java.math.BigDecimal revenueGenerated,
        java.math.BigDecimal monthlyRecurringRevenue,
        String notes
    ) {
        RevenueLeadMemory memory = memoryRepository.findById(leadMemoryId)
            .orElseThrow(() -> new IllegalArgumentException("Lead memory not found: " + leadMemoryId));
        memory.captureFeedback(
            objectionCategory,
            objectionDetail,
            responseLatencyMinutes,
            interestLevel,
            meetingOutcome,
            businessPainLevel,
            decisionMakerPresent,
            budgetRange,
            followUpCount,
            meetingBooked,
            offerAccepted,
            revenueGenerated,
            monthlyRecurringRevenue,
            notes
        );
        return memory;
    }

    @Transactional
    public RevenueLeadMemory scoreLeadManually(
        Long leadMemoryId,
        Boolean instagramAbandoned,
        Boolean familyBusiness,
        Boolean noPromotions,
        Boolean competitiveNeighborhood,
        String scoreNotes
    ) {
        RevenueLeadMemory memory = memoryRepository.findById(leadMemoryId)
            .orElseThrow(() -> new IllegalArgumentException("Lead memory not found: " + leadMemoryId));
        memory.scoreManually(instagramAbandoned, familyBusiness, noPromotions, competitiveNeighborhood, scoreNotes);
        return memory;
    }

    private Task saveStep(String workflowId, int step, Long blockedByTaskId, AgentType agentType, String title, String description) {
        Task task = new Task(title, description, agentType);
        task.attachToWorkflow(workflowId, step, blockedByTaskId);
        return taskRepository.save(task);
    }

    private String buildContext(RevenueLeadMemory memory, String website, String instagram, String notes) {
        return "Product: " + PRODUCT_OFFER
            + "\nTarget price: " + TARGET_PRICE
            + "\nLead: " + memory.getLeadName()
            + "\nNiche: " + memory.getNiche()
            + "\nWebsite: " + nullSafe(website)
            + "\nInstagram: " + nullSafe(instagram)
            + "\nNotes: " + nullSafe(notes)
            + "\nKnown objections: " + nullSafe(memory.getObjections())
            + "\nKnown competitors: " + nullSafe(memory.getCompetitors())
            + "\nCampaign history: " + nullSafe(memory.getCampaignHistory())
            + "\nBehavior notes: " + nullSafe(memory.getBehaviorNotes());
    }

    private String nullSafe(String value) {
        return value == null || value.isBlank() ? "not provided" : value;
    }

    private String extractLeadName(String title) {
        int separator = title.indexOf(": ");
        return separator < 0 ? title : title.substring(separator + 2);
    }
}