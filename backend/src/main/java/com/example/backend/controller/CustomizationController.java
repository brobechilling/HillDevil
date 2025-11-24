package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.CustomizationDTO;
import com.example.backend.dto.request.CustomizationCreateRequest;
import com.example.backend.entities.FeatureCode;
import com.example.backend.service.CustomizationService;
import com.example.backend.service.FeatureLimitCheckerService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/customizations")
public class CustomizationController {

    private final CustomizationService customizationService;
    private final FeatureLimitCheckerService featureLimitCheckerService;

    public CustomizationController(CustomizationService customizationService,
            FeatureLimitCheckerService featureLimitCheckerService) {
        this.customizationService = customizationService;
        this.featureLimitCheckerService = featureLimitCheckerService;
    }

    @GetMapping("")
    public ApiResponse<List<CustomizationDTO>> getAllByRestaurant(
            @RequestParam UUID restaurantId) {
        ApiResponse<List<CustomizationDTO>> res = new ApiResponse<>();
        res.setResult(customizationService.getAllByRestaurant(restaurantId));
        return res;
    }

    @GetMapping("/{id}")
    public ApiResponse<CustomizationDTO> getById(@PathVariable UUID id) {
        ApiResponse<CustomizationDTO> res = new ApiResponse<>();
        res.setResult(customizationService.getById(id));
        return res;
    }

    @PostMapping("")
    public ApiResponse<CustomizationDTO> create(@RequestBody CustomizationCreateRequest request) {
        ApiResponse<CustomizationDTO> res = new ApiResponse<>();
        res.setResult(customizationService.create(request));
        return res;
    }

    @PutMapping("/{id}")
    public ApiResponse<CustomizationDTO> update(@PathVariable UUID id, @RequestBody CustomizationDTO dto) {
        ApiResponse<CustomizationDTO> res = new ApiResponse<>();
        res.setResult(customizationService.update(id, dto));
        return res;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        customizationService.delete(id);
        return new ApiResponse<>();
    }

    @GetMapping("/restaurant/{restaurantId}/category/{categoryId}/can-create")
    public ApiResponse<Boolean> canCreateCustomizationForCategory(
            @PathVariable UUID restaurantId,
            @PathVariable UUID categoryId) {
        ApiResponse<Boolean> res = new ApiResponse<>();
        res.setResult(customizationService.canCreateCustomizationForCategory(restaurantId, categoryId));
        return res;
    }

    @GetMapping("/restaurant/{restaurantId}/limit")
    public ApiResponse<Integer> getCustomizationLimit(
            @PathVariable UUID restaurantId) {
        ApiResponse<Integer> res = new ApiResponse<>();
        try {
            int limit = featureLimitCheckerService.getLimitValue(
                    restaurantId,
                    FeatureCode.LIMIT_CUSTOMIZATION_PER_CATEGORY);
            res.setResult(limit);
            // -1 means unlimited (Premium package)
            // 0 means no access (no subscription)
            // >0 means specific limit (Basic package)
            if (limit == -1) {
                res.setMessage("Unlimited customizations");
            } else if (limit == 0) {
                res.setMessage("No active subscription");
            } else {
                res.setMessage("Limit: " + limit + " customizations per category");
            }
        } catch (Exception e) {
            // If error, return 0 as limit
            res.setResult(0);
            res.setMessage("Error retrieving limit");
        }
        return res;
    }

    @GetMapping("/category/{categoryId}")
    public ApiResponse<List<UUID>> getCustomizationByCategory(@PathVariable UUID categoryId) {
        ApiResponse<List<UUID>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(customizationService.getCustomizationByCategoryId(categoryId));
        return apiResponse;
    }
    
}
