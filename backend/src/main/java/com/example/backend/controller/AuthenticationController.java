package com.example.backend.controller;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

import org.hibernate.validator.internal.util.logging.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.request.AuthenticationRequest;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.dto.response.RefreshResponse;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.service.AuthenticationService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("api/auth")
public class AuthenticationController {
    
    private final AuthenticationService authenticationService;
    private final String REFRESH_TOKEN_COOKIE = "refreshToken";
    private Logger logger = org.slf4j.LoggerFactory.getLogger(getClass());

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    // login to get access and refresh token
    @PostMapping("/token")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> authenticate(@RequestBody AuthenticationRequest authenticationRequest, HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");
        ApiResponse<AuthenticationResponse> apiResponse = new ApiResponse<>();
        AuthenticationResponse authenticationResponse = authenticationService.authenticate(authenticationRequest, clientIp, userAgent);
        // add refresh token cookie or update it in case the token expired or reused
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, authenticationResponse.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/api/auth")
                .sameSite("Strict")
                .maxAge(Duration.ofDays(7))
                .build();
        // refresh token already set in cookie -> remove them
        logger.info("generate access token: " + authenticationResponse.getAccessToken());
        logger.info("generate refresh token: " + authenticationResponse.getRefreshToken());
        authenticationResponse.setRefreshToken("");
        apiResponse.setResult(authenticationResponse);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(apiResponse);
    }

    // refresh with raw refresh token
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshResponse>> refresh(HttpServletRequest request, HttpServletResponse response) {
        String clientIp = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        // get refresh token from cookie
        String refreshToken = Arrays.stream(Optional.ofNullable(request.getCookies()).orElse(new Cookie[0]))
                .filter(c -> REFRESH_TOKEN_COOKIE.equals(c.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        logger.info("refreshToken from cookie: " + refreshToken);
        RefreshResponse refreshResponse = authenticationService.refreshWithOpaqueToken(refreshToken, clientIp, userAgent);
        // update the refresh token cookie
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, refreshResponse.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/api/auth")
                .sameSite("Strict")
                .maxAge(Duration.ofDays(7))
                .build();
        ApiResponse<RefreshResponse> apiResponse = new ApiResponse<>();
        refreshResponse.setRefreshToken("");
        apiResponse.setResult(refreshResponse);
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(apiResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(value = "Authorization", required = true) String authHeader, HttpServletRequest request, HttpServletResponse response) {
        // invalidate access token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            authenticationService.logoutByAccessToken(accessToken);
        }
        // revoke refresh token in db
        String refreshToken = Arrays.stream(Optional.ofNullable(request.getCookies()).orElse(new Cookie[0]))
                .filter(c -> REFRESH_TOKEN_COOKIE.equals(c.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        authenticationService.revokeRefreshToken(refreshToken);
        // delete refresh token in cookie
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, "")
                .httpOnly(true)
                .secure(true)
                .path("/api/auth/refresh")
                .sameSite("Strict")
                .maxAge(0)
                .build();
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(apiResponse);
    }


}
