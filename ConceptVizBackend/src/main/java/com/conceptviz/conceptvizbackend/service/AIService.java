package com.conceptviz.conceptvizbackend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final ChatClient.Builder chatClientBuilder;

    private static final String MERMAID_PROMPT_TEMPLATE = """
            You are a Mermaid.js diagram expert. Generate ONLY valid Mermaid.js syntax for: {topic}
            
            CRITICAL RULES - FOLLOW EXACTLY:
            1. Return ONLY Mermaid code - NO explanations, NO markdown backticks, NO extra text
            2. Start with EXACTLY ONE diagram type declaration on the first line
            3. Use ONLY ONE diagram type - never mix types
            4. Follow strict Mermaid.js syntax for the chosen type
            5. Keep it simple and clear and try to make it visually appealing
            6. If unsure about the topic, create a simple flowchart
            
            Choose the BEST diagram type for this topic:
            - graph TD or graph LR: For processes, workflows, hierarchies, general concepts
            - sequenceDiagram: For API calls, interactions, communications between entities
            - classDiagram: For OOP concepts, data structures, class relationships
            - stateDiagram-v2: For state machines, lifecycles, state transitions
            - erDiagram: For database schemas, entity relationships
            - journey: For user journeys, customer experiences
            - gantt: For timelines, project schedules, roadmaps
            
            Topic: {topic}
            
            IMPORTANT: Output ONLY the Mermaid code, nothing else. Start immediately with the diagram type.
            """;

    public String generateDiagram(String topic) {
        try {
            log.info("Generating diagram for topic: {}", topic);

            PromptTemplate promptTemplate = new PromptTemplate(MERMAID_PROMPT_TEMPLATE);
            Prompt prompt = promptTemplate.create(java.util.Map.of("topic", topic));

            ChatClient chatClient = chatClientBuilder.build();
            String response = chatClient.prompt(prompt)
                    .call()
                    .content();

            // Clean and validate the response
            String cleanedResponse = cleanMermaidCode(response);

            // Validate it's proper Mermaid syntax
            if (!isValidMermaidSyntax(cleanedResponse)) {
                log.warn("Generated invalid Mermaid syntax, using fallback");
                return generateFallbackDiagram(topic);
            }

            log.info("Generated Mermaid code: {}", cleanedResponse);
            return cleanedResponse;

        } catch (Exception e) {
            log.error("Error generating diagram: ", e);
            return generateFallbackDiagram(topic);
        }
    }

    private String cleanMermaidCode(String response) {
        if (response == null || response.trim().isEmpty()) {
            return "";
        }

        // Remove markdown code blocks
        String cleaned = response.replaceAll("```mermaid\\s*", "")
                .replaceAll("```\\s*", "")
                .trim();

        // Split into lines and find the diagram start
        String[] lines = cleaned.split("\n");
        StringBuilder result = new StringBuilder();
        boolean foundStart = false;
        String diagramType = null;

        for (String line : lines) {
            String trimmedLine = line.trim();

            // Skip empty lines at the start
            if (!foundStart && trimmedLine.isEmpty()) {
                continue;
            }

            // Check if this line starts a valid diagram
            if (!foundStart && isValidDiagramStart(trimmedLine)) {
                foundStart = true;
                diagramType = extractDiagramType(trimmedLine);
                result.append(trimmedLine).append("\n");
                continue;
            }

            // Once we've found the start, add all non-empty lines
            if (foundStart && !trimmedLine.isEmpty()) {
                // Don't allow mixing diagram types
                if (isValidDiagramStart(trimmedLine) && !trimmedLine.startsWith(diagramType)) {
                    break; // Stop if we encounter a different diagram type
                }
                result.append(line).append("\n");
            }
        }

        return result.toString().trim();
    }

    private boolean isValidDiagramStart(String line) {
        return line.matches("^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram-v2|erDiagram|journey|gantt|gitGraph).*");
    }

    private String extractDiagramType(String line) {
        if (line.startsWith("graph") || line.startsWith("flowchart")) {
            return "graph";
        } else if (line.startsWith("sequenceDiagram")) {
            return "sequenceDiagram";
        } else if (line.startsWith("classDiagram")) {
            return "classDiagram";
        } else if (line.startsWith("stateDiagram")) {
            return "stateDiagram";
        } else if (line.startsWith("erDiagram")) {
            return "erDiagram";
        } else if (line.startsWith("journey")) {
            return "journey";
        } else if (line.startsWith("gantt")) {
            return "gantt";
        } else if (line.startsWith("gitGraph")) {
            return "gitGraph";
        }
        return "graph";
    }

    private boolean isValidMermaidSyntax(String code) {
        if (code == null || code.trim().isEmpty()) {
            return false;
        }

        String firstLine = code.split("\n")[0].trim();

        // Must start with a valid diagram type
        if (!isValidDiagramStart(firstLine)) {
            return false;
        }

        // Must have at least 2 lines
        String[] lines = code.split("\n");
        if (lines.length < 2) {
            return false;
        }

        // Should not contain obvious errors
        if (code.contains("```") || code.contains("Here is") || code.contains("Here's")) {
            return false;
        }

        return true;
    }

    private String generateFallbackDiagram(String topic) {
        return String.format("""
                graph TD
                    A[%s] --> B[Understanding]
                    B --> C[Analysis]
                    C --> D[Implementation]
                    D --> E[Results]
                    E --> F[Evaluation]
                """, topic.length() > 50 ? topic.substring(0, 50) + "..." : topic);
    }
}