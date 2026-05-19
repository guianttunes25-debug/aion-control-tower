package com.taskmaster.web.browser;

import com.taskmaster.application.browser.BrowserAutopilotDecision;
import com.taskmaster.application.browser.BrowserAutopilotObserveCommand;
import com.taskmaster.application.browser.BrowserAutopilotService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/browser-autopilot/sessions")
public class BrowserAutopilotController {

    private final BrowserAutopilotService service;

    public BrowserAutopilotController(BrowserAutopilotService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<BrowserAutopilotSessionResponse> create(@Valid @RequestBody CreateBrowserAutopilotSessionRequest request) {
        BrowserAutopilotSessionResponse response = BrowserAutopilotSessionResponse.from(
            service.createSession(request.goal(), request.startUrl())
        );
        return ResponseEntity.created(URI.create("/browser-autopilot/sessions/" + response.id())).body(response);
    }

    @GetMapping
    public List<BrowserAutopilotSessionResponse> list() {
        return service.listSessions().stream().map(BrowserAutopilotSessionResponse::from).toList();
    }

    @GetMapping("/{sessionId}")
    public BrowserAutopilotSessionResponse get(@PathVariable String sessionId) {
        return BrowserAutopilotSessionResponse.from(service.getSession(sessionId));
    }

    @PostMapping("/{sessionId}/observe")
    public BrowserAutopilotSessionResponse observe(
        @PathVariable String sessionId,
        @Valid @RequestBody ObserveBrowserPageRequest request
    ) {
        return BrowserAutopilotSessionResponse.from(service.observe(sessionId, new BrowserAutopilotObserveCommand(
            request.url(),
            request.title(),
            request.headings(),
            request.clickables(),
            request.actionLabels()
        )));
    }

    @PostMapping("/{sessionId}/decide")
    public BrowserAutopilotDecision decide(@PathVariable String sessionId) {
        return service.decide(sessionId);
    }

    @PostMapping("/{sessionId}/execution-result")
    public BrowserAutopilotSessionResponse recordExecution(
        @PathVariable String sessionId,
        @Valid @RequestBody BrowserExecutionResultRequest request
    ) {
        return BrowserAutopilotSessionResponse.from(service.recordExecution(sessionId, request.result()));
    }
}