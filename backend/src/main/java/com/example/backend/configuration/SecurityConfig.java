package com.example.backend.configuration;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.backend.entities.RoleName;
import com.example.backend.configuration.JwtAuthenticationEntryPoint;
import com.example.backend.configuration.CustomAccessDeniedHandler;
import com.example.backend.configuration.MyCustomJwtDecoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    private final String[] PUBLIC_ENDPOINTS = {"/api/auth/token", "/api/auth/logout", "/api/auth/refresh", "/api/users/signup", "/api/payments/**", "/api/subscriptions/**", "/api/restaurants/paginated", "/api/staff/**",  "/api/packages/**", "/api/branches/**", "/api/public/**", "/api/public/tables/**", "/api/users/mail/**"};
    private final String[] ADMIN_ENDPOINTS = {"/api/users/**", "/api/roles/**"};
    private final String[] RESTAURANT_OWNER_ENDPOINTS = {};
    private final String[] BRANCH_MANAGER_ENDPOINTS = {};
    private final String[] WAITER_ENDPOINTS = {};
    private final String[] RECEPTIONIST_ENDPOINTS = {};


    @Value("${jwt.signer-key}")
    private String signerKey;
    private final MyCustomJwtDecoder myCustomJwtDecoder;

    public SecurityConfig(MyCustomJwtDecoder myCustomJwtDecoder) {
        this.myCustomJwtDecoder = myCustomJwtDecoder;
    }

    // SecurityFilterChain for public endpoints - NO JWT validation
    @Bean
    @org.springframework.core.annotation.Order(1)
    public SecurityFilterChain publicSecurityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
            .securityMatcher("/api/public/**")
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()));
        
        return httpSecurity.build();
    }
    
    // SecurityFilterChain for protected endpoints - WITH JWT validation
    @Bean
    @org.springframework.core.annotation.Order(2)
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(request -> 
            request
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // allow preflight request in local
                .requestMatchers("/actuator/health").permitAll()
                // Public endpoints (these should not reach here if publicSecurityFilterChain works correctly)
                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                
                // User API
                .requestMatchers(HttpMethod.GET, "/api/users/{userId}").hasAnyRole(RoleName.ADMIN.name(), RoleName.RESTAURANT_OWNER.name())
                .requestMatchers(HttpMethod.PUT, "/api/users").hasAnyRole(RoleName.ADMIN.name(), RoleName.RESTAURANT_OWNER.name())
                .requestMatchers(HttpMethod.POST, "/api/users/changepass").hasAnyRole(RoleName.ADMIN.name(), RoleName.RESTAURANT_OWNER.name())
                .requestMatchers("/api/users/**").hasAnyRole(RoleName.ADMIN.name()) 

                // Role API
                .requestMatchers("/api/roles/**").hasAnyRole(RoleName.ADMIN.name())

                // Table API - Allow both OWNER and MANAGER to update status
                .requestMatchers(HttpMethod.PATCH, "/api/owner/tables/*/status").hasAnyRole(RoleName.RESTAURANT_OWNER.name(), RoleName.BRANCH_MANAGER.name())
                .requestMatchers("/api/owner/tables/**").hasAnyRole(RoleName.RESTAURANT_OWNER.name(), RoleName.BRANCH_MANAGER.name())

                // All other /api/** endpoints require authentication
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll());

        // Apply JWT authentication only for this filter chain
        httpSecurity.oauth2ResourceServer(oauth2 -> 
            oauth2.jwt(jwtConfig -> jwtConfig.decoder(myCustomJwtDecoder).jwtAuthenticationConverter(jwtAuthenticationConverter()))
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
            );
        httpSecurity.exceptionHandling(exception -> 
            exception.authenticationEntryPoint(new JwtAuthenticationEntryPoint()).accessDeniedHandler(new CustomAccessDeniedHandler()));
        httpSecurity.csrf(AbstractHttpConfigurer::disable);
        httpSecurity.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        
        return httpSecurity.build();
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix(""); 
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    // @Bean
    // public CorsFilter corsFilter() {
    //     CorsConfiguration corsConfiguration = new CorsConfiguration();
    //     corsConfiguration.setAllowedOrigins(List.of(
    //         "https://hilldevil.space",
    //         "http://localhost:5000" 
    //     ));
    //     corsConfiguration.addAllowedHeader("*");
    //     corsConfiguration.addAllowedMethod("*");
    //     corsConfiguration.setAllowCredentials(true);
    //     UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
    //     urlBasedCorsConfigurationSource.registerCorsConfiguration("/api/**", corsConfiguration);
    //     return new CorsFilter(urlBasedCorsConfigurationSource);
    // } 

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.setAllowedOrigins(List.of(
            "https://hilldevil.space",
            "http://localhost:5000"
        ));
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.addAllowedMethod("*");
        corsConfiguration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return source;
    }
}
