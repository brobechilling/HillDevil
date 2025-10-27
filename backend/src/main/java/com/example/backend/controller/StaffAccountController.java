package com.example.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.StaffAccountDTO;
import com.example.backend.dto.request.CreateStaffAccountRequest;
import com.example.backend.service.StaffAccountService;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController
@RequestMapping("/api/staff")
public class StaffAccountController {

    private final StaffAccountService staffAccountService;

    public StaffAccountController(StaffAccountService staffAccountService) {
        this.staffAccountService = staffAccountService;
    }

    @GetMapping("")
    public ApiResponse<List<StaffAccountDTO>> getAllStaff() {
        ApiResponse<List<StaffAccountDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.getAllStaffAccounts());
        return apiResponse;
    }

    @PostMapping("")
    public ApiResponse<StaffAccountDTO> createStaffAccount(@RequestBody CreateStaffAccountRequest createStaffAccountRequest) {
        ApiResponse<StaffAccountDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.createStaffAccount(createStaffAccountRequest));
        return apiResponse;
    }
    
}
