package com.example.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Value("${spring.datasource.url}")
    private String urlString;

    @GetMapping()
    public ResponseEntity<String> getMethodName() {
        return ResponseEntity.ok().body(urlString);
    }
    
}
