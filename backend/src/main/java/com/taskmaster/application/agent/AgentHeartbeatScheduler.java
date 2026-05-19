package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.AgentStatus;
import com.taskmaster.domain.agent.RuntimeEventType;
import com.taskmaster.infrastructure.agent.AgentRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AgentHeartbeatScheduler {

    private static final String[] LOCAL_AGENT_NAMES = {
        "PlannerAgent",
        "ResearchAgent",
        "CodeAgent",
        "ReviewAgent",
        "FixAgent",
        "TestAgent",
        "DeployAgent",
        "LeadResearchAgent",
        "OpportunityScoreAgent",
        "OfferGenerationAgent",
        "OutreachAgent",
        "ReplyAnalysisAgent"
    };

    private final AgentRepository agentRepository;
    private final AgentRuntimeRecorder recorder;

    public AgentHeartbeatScheduler(AgentRepository agentRepository, AgentRuntimeRecorder recorder) {
        this.agentRepository = agentRepository;
        this.recorder = recorder;
    }

    @Scheduled(fixedDelay = 10000)
    @Transactional
    public void heartbeatLocalAgents() {
        for (String agentName : LOCAL_AGENT_NAMES) {
            agentRepository.findByName(agentName).ifPresent(this::heartbeat);
        }
    }

    private void heartbeat(Agent agent) {
        if (agent.getStatus() == AgentStatus.OFFLINE) {
            agent.markAvailable();
            recorder.event(RuntimeEventType.AGENT_AVAILABLE, agent, null, agent.getName() + " recovered from heartbeat");
        }
        agent.heartbeat();
        recorder.event(RuntimeEventType.AGENT_HEARTBEAT, agent, null, agent.getName() + " heartbeat received");
    }

    @Scheduled(fixedDelay = 15000)
    @Transactional
    public void markDeadAgentsOffline() {
        Instant heartbeatThreshold = Instant.now().minus(30, ChronoUnit.SECONDS);
        agentRepository.findAll().stream()
            .filter(agent -> agent.getStatus() != AgentStatus.OFFLINE)
            .filter(agent -> agent.getLastHeartbeat() != null && agent.getLastHeartbeat().isBefore(heartbeatThreshold))
            .forEach(this::markOffline);
    }

    private void markOffline(Agent agent) {
        agent.markOffline();
        recorder.warn(agent, null, agent.getName() + " marked OFFLINE after heartbeat timeout");
        recorder.event(RuntimeEventType.AGENT_OFFLINE, agent, null, agent.getName() + " marked OFFLINE");
    }
}