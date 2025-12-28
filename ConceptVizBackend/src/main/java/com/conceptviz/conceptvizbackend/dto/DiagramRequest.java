package com.conceptviz.conceptvizbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DiagramRequest {

    @NotBlank(message = "Topic is required")
    @Size(max = 500, message = "Topic must not exceed 500 characters")
    private String topic;
}