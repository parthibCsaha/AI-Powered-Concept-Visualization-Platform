package com.conceptviz.conceptvizbackend.controller;


import com.conceptviz.conceptvizbackend.dto.DiagramRequest;
import com.conceptviz.conceptvizbackend.dto.DiagramResponse;
import com.conceptviz.conceptvizbackend.dto.SaveDiagramRequest;
import com.conceptviz.conceptvizbackend.service.DiagramService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/diagram")
@RequiredArgsConstructor
public class DiagramController {

    private final DiagramService diagramService;

    @PostMapping("/generate")
    public ResponseEntity<DiagramResponse> generateDiagram(@Valid @RequestBody DiagramRequest request) {
        try {
            DiagramResponse response = diagramService.generateDiagram(request.getTopic());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/save")
    public ResponseEntity<DiagramResponse> saveDiagram(@Valid @RequestBody SaveDiagramRequest request) {
        try {
            DiagramResponse response = diagramService.saveDiagram(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my-history")
    public ResponseEntity<List<DiagramResponse>> getMyHistory() {
        try {
            List<DiagramResponse> history = diagramService.getUserHistory();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}