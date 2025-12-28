package com.conceptviz.conceptvizbackend.service;


import com.conceptviz.conceptvizbackend.dto.DiagramResponse;
import com.conceptviz.conceptvizbackend.dto.SaveDiagramRequest;
import com.conceptviz.conceptvizbackend.entity.Diagram;
import com.conceptviz.conceptvizbackend.entity.User;
import com.conceptviz.conceptvizbackend.repository.DiagramRepository;
import com.conceptviz.conceptvizbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiagramService {

    private final DiagramRepository diagramRepository;
    private final UserRepository userRepository;
    private final AIService aiService;

    public DiagramResponse generateDiagram(String topic) {
        String mermaidCode = aiService.generateDiagram(topic);

        DiagramResponse response = new DiagramResponse();
        response.setTopic(topic);
        response.setMermaidCode(mermaidCode);

        return response;
    }

    public DiagramResponse saveDiagram(SaveDiagramRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Diagram diagram = new Diagram();
        diagram.setUser(user);
        diagram.setTopic(request.getTopic());
        diagram.setMermaidCode(request.getMermaidCode());

        Diagram savedDiagram = diagramRepository.save(diagram);

        return mapToResponse(savedDiagram);
    }

    public List<DiagramResponse> getUserHistory() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Diagram> diagrams = diagramRepository.findByUserOrderByCreatedAtDesc(user);

        return diagrams.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private DiagramResponse mapToResponse(Diagram diagram) {
        DiagramResponse response = new DiagramResponse();
        response.setId(diagram.getId());
        response.setTopic(diagram.getTopic());
        response.setMermaidCode(diagram.getMermaidCode());
        response.setCreatedAt(diagram.getCreatedAt());
        return response;
    }
}