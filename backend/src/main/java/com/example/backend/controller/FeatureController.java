package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.FeatureDTO;
import com.example.backend.service.FeatureService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/features")
public class FeatureController {
    private final FeatureService featureService;

    public FeatureController(FeatureService featureService) {
        this.featureService = featureService;
    }

    @GetMapping("")
    public ApiResponse<List<FeatureDTO>> getAllFeatures() {
        ApiResponse<List<FeatureDTO>> response = new ApiResponse<>();
        response.setResult(featureService.getAllAvailableFeatures());
        return response;
    }
}
