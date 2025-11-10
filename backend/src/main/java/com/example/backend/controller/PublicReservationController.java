package com.example.backend.controller;

import com.example.backend.dto.response.*;
import com.example.backend.service.PublicReservationPageService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/public")
public class PublicReservationController {

    private final PublicReservationPageService publicPageService;

    public PublicReservationController(PublicReservationPageService publicPageService) {
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