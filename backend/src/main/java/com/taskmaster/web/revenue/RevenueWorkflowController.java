package com.taskmaster.web.revenue;

import com.taskmaster.application.revenue.RevenueWorkflowService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/revenue/workflows")
public class RevenueWorkflowController {

    private final RevenueWorkflowService service;

    public RevenueWorkflowController(RevenueWorkflowService service) {
        this.service = service;
    }

    @PostMapping("/local-growth")
    public ResponseEntity<RevenueWorkflowResponse> createLocalGrowthWorkflow(@Valid @RequestBody CreateRevenueWorkflowRequest request) {
        RevenueWorkflowResponse response = RevenueWorkflowResponse.from(
            service.createLocalGrowthWorkflow(request.leadName(), request.niche(), request.website(), request.instagram(), request.notes())
        );
        return ResponseEntity.created(URI.create("/revenue/workflows/" + response.workflowId())).body(response);
    }

    @GetMapping("/{workflowId}")
    public RevenueWorkflowResponse getWorkflow(@PathVariable String workflowId) {
        return RevenueWorkflowResponse.from(service.getWorkflow(workflowId));
    }

    @GetMapping("/memory/leads")
    public List<RevenueLeadMemoryResponse> leadMemories() {
        return service.listLeadMemories().stream().map(RevenueLeadMemoryResponse::from).toList();
    }

    @GetMapping("/memory/leads/priority")
    public List<RevenueLeadMemoryResponse> prioritizedLeadMemories() {
        return service.listPrioritizedLeadMemories().stream().map(RevenueLeadMemoryResponse::from).toList();
    }

    @PatchMapping("/memory/leads/{leadMemoryId}/feedback")
    public RevenueLeadMemoryResponse captureLeadFeedback(
        @PathVariable Long leadMemoryId,
        @Valid @RequestBody LeadFeedbackRequest request
    ) {
        return RevenueLeadMemoryResponse.from(service.captureLeadFeedback(
            leadMemoryId,
            request.objectionCategory(),
            request.objectionDetail(),
            request.responseLatencyMinutes(),
            request.interestLevel(),
            request.meetingOutcome(),
            request.businessPainLevel(),
            request.decisionMakerPresent(),
            request.budgetRange(),
            request.followUpCount(),
            request.meetingBooked(),
            request.offerAccepted(),
            request.revenueGenerated(),
            request.monthlyRecurringRevenue(),
            request.notes()
        ));
    }

    @PatchMapping("/memory/leads/{leadMemoryId}/score")
    public RevenueLeadMemoryResponse scoreLeadManually(
        @PathVariable Long leadMemoryId,
        @Valid @RequestBody LeadScoreRequest request
    ) {
        return RevenueLeadMemoryResponse.from(service.scoreLeadManually(
            leadMemoryId,
            request.instagramAbandoned(),
            request.familyBusiness(),
            request.noPromotions(),
            request.competitiveNeighborhood(),
            request.scoreNotes()
        ));
    }

    @GetMapping("/metrics/pmf")
    public RevenueMetricsResponse pmfMetrics() {
        return RevenueMetricsResponse.from(service.metrics());
    }
}