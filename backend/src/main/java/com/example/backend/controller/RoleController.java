package com.example.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.RoleDTO;
import com.example.backend.service.RoleService;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping("")
    public ApiResponse<List<RoleDTO>> getAll(@RequestParam String param) {
        ApiResponse<List<RoleDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(roleService.getAllRoles());
        return apiResponse;
    }
    
}
