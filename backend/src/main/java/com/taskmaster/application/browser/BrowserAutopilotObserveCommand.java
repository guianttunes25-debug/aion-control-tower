package com.taskmaster.application.browser;

import java.util.List;

public record BrowserAutopilotObserveCommand(
    String url,
    String title,
    List<String> headings,
    int clickables,
    List<String> actionLabels
) {
}