package com.example.backend.controller;

import com.example.backend.dto.response.*;
import com.example.backend.service.PublicPageService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/public")
public class PublicPageController {

    private final PublicPageService publicPageService;

    public PublicPageController(PublicPageService publicPageService) {
        this.publicPageService = publicPageService;
    }

    @GetMapping("/restaurant/{slug}")
    public RestaurantPublicResponse getRestaurant(@PathVariable String slug) {
        return publicPageService.getRestaurantBySlug(slug);
    }

    @GetMapping("/restaurant/{slug}/menu")
    public MenuPublicResponse getRestaurantMenu(@PathVariable String slug) {
        return publicPageService.getRestaurantMenuBySlug(slug);
    }

}