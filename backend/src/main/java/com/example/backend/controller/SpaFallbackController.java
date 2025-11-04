package com.example.backend.controller;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@Order(Integer.MAX_VALUE) // Lowest priority - only match if no other controller matches
public class SpaFallbackController {
    @RequestMapping(value = {
        "/{path:[^\\.]*}",
        "/**/{path:[^\\.]*}"
    })
    public String redirect() {
        // This controller only handles non-API paths for SPA routing
        // API endpoints (/api/**) should be handled by @RestController first
        return "forward:/index.html";
    }
}