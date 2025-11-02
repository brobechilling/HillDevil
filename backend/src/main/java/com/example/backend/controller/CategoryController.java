package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.CategoryDTO;
import com.example.backend.dto.request.CategoryCreateRequest;
import com.example.backend.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("")
    public ApiResponse<List<CategoryDTO>> getAllByRestaurant(
            @RequestParam UUID restaurantId
    ) {
        ApiResponse<List<CategoryDTO>> res = new ApiResponse<>();
        res.setResult(categoryService.getAllByRestaurant(restaurantId));
        return res;
    }

    @GetMapping("/{id}")
    public ApiResponse<CategoryDTO> getById(@PathVariable UUID id) {
        ApiResponse<CategoryDTO> res = new ApiResponse<>();
        res.setResult(categoryService.getById(id));
        return res;
    }

    @PostMapping("")
    public ApiResponse<CategoryDTO> create(@RequestBody CategoryCreateRequest request) {
        ApiResponse<CategoryDTO> res = new ApiResponse<>();
        res.setResult(categoryService.create(request));
        return res;
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryDTO> update(@PathVariable UUID id, @RequestBody CategoryDTO dto) {
        ApiResponse<CategoryDTO> res = new ApiResponse<>();
        res.setResult(categoryService.update(id, dto));
        return res;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        categoryService.delete(id);
        return new ApiResponse<>();
    }
}
