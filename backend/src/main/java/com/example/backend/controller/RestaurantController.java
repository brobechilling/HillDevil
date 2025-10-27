package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.RestaurantDTO;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.service.RestaurantService;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @GetMapping("")
    public ApiResponse<List<RestaurantDTO>> getAll() {
        ApiResponse<List<RestaurantDTO>> res = new ApiResponse<>();
        res.setResult(restaurantService.getAll());
        return res;
    }

    @GetMapping("/{id}")
    public ApiResponse<RestaurantDTO> getById(@PathVariable UUID id) {
        ApiResponse<RestaurantDTO> res = new ApiResponse<>();
        res.setResult(restaurantService.getById(id));
        return res;
    }

    @PutMapping("/{id}")
    public ApiResponse<RestaurantDTO> update(@PathVariable UUID id, @RequestBody RestaurantDTO dto) {
        ApiResponse<RestaurantDTO> res = new ApiResponse<>();
        res.setResult(restaurantService.update(id, dto));
        return res;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        ApiResponse<Void> res = new ApiResponse<>();
        restaurantService.delete(id);
        return res;
    }

    @GetMapping("/owner/{userId}")
    public ApiResponse<List<RestaurantDTO>> getByOwner(@PathVariable UUID userId) {
        ApiResponse<List<RestaurantDTO>> res = new ApiResponse<>();
        res.setResult(restaurantService.getByOwner(userId));
        return res;
    }

    @GetMapping("/paginated")
    public ApiResponse<PageResponse<RestaurantDTO>> getPaginated(@RequestParam( required = false, defaultValue = "1") int page, 
                                                        @RequestParam( required = false, defaultValue = "1") int size) {
        ApiResponse<PageResponse<RestaurantDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(restaurantService.getRestaurantPaginated(page, size));
        return apiResponse;
    }
    
}
