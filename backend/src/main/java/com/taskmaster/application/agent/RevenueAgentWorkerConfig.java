package com.taskmaster.application.agent;

import com.taskmaster.domain.agent.Agent;
import com.taskmaster.domain.agent.AgentType;
import com.taskmaster.domain.task.Task;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RevenueAgentWorkerConfig {

    @Bean
    AionAgentWorker leadResearchAgentWorker(SimulatedAgentExecutor executor) {
        return new DelegatingAgentWorker(AgentType.LEAD_RESEARCH, executor);
    }

    @Bean
    AionAgentWorker opportunityScoreAgentWorker(SimulatedAgentExecutor executor) {
        return new DelegatingAgentWorker(AgentType.OPPORTUNITY_SCORE, executor);
    }

    @Bean
    AionAgentWorker offerGenerationAgentWorker(SimulatedAgentExecutor executor) {
        return new DelegatingAgentWorker(AgentType.OFFER_GENERATION, executor);
    }

    @Bean
    AionAgentWorker outreachAgentWorker(SimulatedAgentExecutor executor) {
        return new DelegatingAgentWorker(AgentType.OUTREACH, executor);
    }

    @Bean
    AionAgentWorker replyAnalysisAgentWorker(SimulatedAgentExecutor executor) {
        return new DelegatingAgentWorker(AgentType.REPLY_ANALYSIS, executor);
    }

    private record DelegatingAgentWorker(AgentType type, SimulatedAgentExecutor executor) implements AionAgentWorker {

        @Override
        public void execute(Task task, Agent agent) {
            executor.execute(task, agent);
        }
    }
}