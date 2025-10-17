package com.example.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.UserDTO;
import com.example.backend.dto.request.SignupRequest;
import com.example.backend.service.UserService;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping("")
    public ApiResponse<List<UserDTO>> getAllUsers() {
        ApiResponse<List<UserDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getAll());
        return apiResponse;
    }

    // hash seed data password to fit the spring password encoder
    // @GetMapping("seed")
    // public ApiResponse<List<UserDTO>> hashSeedPassword() {
    //     ApiResponse<List<UserDTO>> apiResponse = new ApiResponse<>();
    //     apiResponse.setResult(userService.hashSeedPassword());
    //     return apiResponse;
    // }
    
    @PostMapping("/signup")
    public ApiResponse<UserDTO> signUp(@RequestBody @Valid SignupRequest signupRequest) {
        ApiResponse<UserDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.signUp(signupRequest));
        return apiResponse;
    }

    @GetMapping("/deleted")
    public ApiResponse<List<UserDTO>> getAllUsersIncludeDeleted() {
        ApiResponse<List<UserDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getAll());
        return apiResponse;
    }

    @GetMapping("/{userId}")
    public ApiResponse<UserDTO> getUserById(@PathVariable UUID userId) {
        ApiResponse<UserDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getUserById(userId));
        return apiResponse;
    }
    
    @PutMapping("")
    public ApiResponse<UserDTO> updateUser(@RequestBody @Valid UserDTO userDTO) {
        ApiResponse<UserDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.updateUser(userDTO));
        return apiResponse;
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<UserDTO> deleteUserById(@PathVariable UUID userId) {
        ApiResponse<UserDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.deleteUserById(userId));
        return apiResponse;
    }


}
