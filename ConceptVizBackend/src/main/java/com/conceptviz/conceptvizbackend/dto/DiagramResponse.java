package com.conceptviz.conceptvizbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiagramResponse {
    private Long id;
    private String topic;
    private String mermaidCode;
    private LocalDateTime createdAt;
}