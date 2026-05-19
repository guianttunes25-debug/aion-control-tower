package com.taskmaster.application.browser;

public class BrowserAutopilotSessionNotFoundException extends RuntimeException {

    public BrowserAutopilotSessionNotFoundException(String sessionId) {
        super("Browser autopilot session not found: " + sessionId);
    }
}