package com.example.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.AuthenticationRequest;
import com.example.backend.dto.request.RefreshRequest;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.service.AuthenticationService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("api/auth")
public class AuthenticationController {
    
    private final AuthenticationService authenticationService;

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    // get access and refresh token
    @PostMapping("/token")
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest req, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");
        ApiResponse<AuthenticationResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(authenticationService.authenticate(req, clientIp, userAgent));
        return apiResponse;
    }

    // refresh with raw refresh token
    @PostMapping("/refresh")
    public ApiResponse<AuthenticationResponse> refresh(@RequestBody RefreshRequest body, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");
        ApiResponse<AuthenticationResponse> res = new ApiResponse<>();
        res.setResult(authenticationService.refreshWithOpaqueToken(body.getRefreshToken(), clientIp, userAgent));
        return res;
    }

    // logout: invalidate both access token and refresh token
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader, @RequestBody(required = false) RefreshRequest body) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            authenticationService.logoutByAccessToken(accessToken);
        }
        if (body != null && body.getRefreshToken() != null) {
            authenticationService.revokeRefreshToken(body.getRefreshToken());
        }
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("logout successfully");
        return apiResponse;
    }


}
