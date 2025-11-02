package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.CustomizationDTO;
import com.example.backend.dto.request.CustomizationCreateRequest;
import com.example.backend.service.CustomizationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customizations")
public class CustomizationController {

    private final CustomizationService customizationService;

    public CustomizationController(CustomizationService customizationService) {
        this.customizationService = customizationService;
    }

    @GetMapping("")
    public ApiResponse<List<CustomizationDTO>> getAllByRestaurant(
            @RequestParam UUID restaurantId
    ) {
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
}
