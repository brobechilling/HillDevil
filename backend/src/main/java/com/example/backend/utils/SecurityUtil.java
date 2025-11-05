package com.example.backend.utils;

import com.example.backend.entities.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class SecurityUtil {

    private final UserRepository userRepository;

    public SecurityUtil(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<Authentication> getCurrentAuthentication() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication());
    }

    public Optional<Jwt> getCurrentJwt() {
        return getCurrentAuthentication()
                .filter(auth -> auth instanceof JwtAuthenticationToken)
                .map(auth -> ((JwtAuthenticationToken) auth).getToken());
    }

    public Optional<UUID> getCurrentUserId() {
        return getCurrentJwt()
                .map(jwt -> {
                    String subject = jwt.getSubject(); // subject chính là userId được set khi tạo JWT
                    try {
                        return UUID.fromString(subject);
                    } catch (IllegalArgumentException e) {
                        return null;
                    }
                });
    }

    public Optional<User> getOptionalCurrentUser() {
        return getCurrentUserId().flatMap(userRepository::findById);
    }

    /**
     * Throw exception nếu user chưa đăng nhập
     */
    public User getCurrentUser() {
        return getOptionalCurrentUser()
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));
    }

    public boolean isAuthenticated() {
        return getCurrentAuthentication()
                .map(Authentication::isAuthenticated)
                .orElse(false);
    }
}
