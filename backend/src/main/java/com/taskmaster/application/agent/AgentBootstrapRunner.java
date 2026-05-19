package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.AgentType;
import com.taskmaster.domain.agent.RuntimeEventType;
import com.taskmaster.infrastructure.agent.AgentRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AgentBootstrapRunner implements ApplicationRunner {

    private static final String FAKE_CODE_AGENT_NAME = "FakeCodeAgent";
    private static final AgentSpec[] LOCAL_AGENTS = {
        new AgentSpec("PlannerAgent", AgentType.PLANNER),
        new AgentSpec("ResearchAgent", AgentType.RESEARCH),
        new AgentSpec("CodeAgent", AgentType.CODE),
        new AgentSpec("ReviewAgent", AgentType.REVIEW),
        new AgentSpec("FixAgent", AgentType.FIX),
        new AgentSpec("TestAgent", AgentType.TEST),
        new AgentSpec("DeployAgent", AgentType.DEPLOY),
        new AgentSpec("LeadResearchAgent", AgentType.LEAD_RESEARCH),
        new AgentSpec("OpportunityScoreAgent", AgentType.OPPORTUNITY_SCORE),
        new AgentSpec("OfferGenerationAgent", AgentType.OFFER_GENERATION),
        new AgentSpec("OutreachAgent", AgentType.OUTREACH),
        new AgentSpec("ReplyAnalysisAgent", AgentType.REPLY_ANALYSIS)
    };

    private final AgentRepository repository;
    private final AgentRuntimeRecorder recorder;

    public AgentBootstrapRunner(AgentRepository repository, AgentRuntimeRecorder recorder) {
        this.repository = repository;
        this.recorder = recorder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (AgentSpec localAgent : LOCAL_AGENTS) {
            Agent agent = repository.findByName(localAgent.name())
                .orElseGet(() -> repository.save(new Agent(localAgent.name(), localAgent.type())));
            agent.markAvailable();
            recorder.event(RuntimeEventType.AGENT_AVAILABLE, agent, null, agent.getName() + " available after backend startup");
        }

        repository.findByName(FAKE_CODE_AGENT_NAME).ifPresent(Agent::markOffline);
    }

    private record AgentSpec(String name, AgentType type) {
    }
}