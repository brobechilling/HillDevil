package com.example.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.StaffAccountDTO;
import com.example.backend.dto.request.CreateStaffAccountRequest;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.service.StaffAccountService;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;




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

    @PutMapping("")
    public ApiResponse<StaffAccountDTO> updateStaffAccount(@RequestBody StaffAccountDTO staffAccountDTO) {
        ApiResponse<StaffAccountDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.updateStaffAccount(staffAccountDTO));
        return apiResponse;
    }

    @DeleteMapping("{staffAccountId}")
    public ApiResponse<StaffAccountDTO> setStaffAccountStatus(@PathVariable UUID staffAccountId) {
        ApiResponse<StaffAccountDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.setStaffAccountStatus(staffAccountId));
        return apiResponse;
    }

    @GetMapping("/paginated")
    public ApiResponse<PageResponse<StaffAccountDTO>> getStaffAccountPaginated(@RequestParam( required = false, defaultValue = "1") int page, @RequestParam( required = false, defaultValue = "1") int size, @RequestParam UUID branchId) {
        ApiResponse<PageResponse<StaffAccountDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.getStaffAccountPaginated(page, size, branchId));
        return apiResponse;
    }

    @GetMapping("/statistic/waiter/{branchId}")
    public ApiResponse<Long> getWaiterNumber(@PathVariable UUID branchId) {
        ApiResponse<Long> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.getWaiterNumber(branchId));
        return apiResponse;
    }

    @GetMapping("/statistic/receptionist/{branchId}")
    public ApiResponse<Long> getReceptionistNumber(@PathVariable UUID branchId) {
        ApiResponse<Long> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.getReceptionistNumber(branchId));
        return apiResponse;
    }

    @GetMapping("/statistic/manager/{branchId}")
    public ApiResponse<Long> getManagerNumber(@PathVariable UUID branchId) {
        ApiResponse<Long> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.getManagerNumber(branchId));
        return apiResponse;
    }
    
}
