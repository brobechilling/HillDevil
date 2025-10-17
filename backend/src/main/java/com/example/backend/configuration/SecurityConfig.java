package com.example.backend.configuration;

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
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.example.backend.entities.RoleName;

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    private final String[] PUBLIC_ENDPOINTS = {"/api/auth/token", "/api/auth/logout", "/api/auth/refresh", "/api/users/signup", "/api/payments/webhook"};
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

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(request -> 
            request
                .requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS).permitAll()
                .requestMatchers(ADMIN_ENDPOINTS).hasAnyRole(RoleName.ADMIN.name()) 
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll());

            // config jwt authentication provider so that authentication filter can check the Authorization: Bearer token in the header of the request
            httpSecurity.oauth2ResourceServer(oauth2 -> 
                oauth2.jwt(jwtConfig -> jwtConfig.decoder(myCustomJwtDecoder).jwtAuthenticationConverter(jwtAuthenticationConverter()))
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
            );
        
        httpSecurity.csrf(AbstractHttpConfigurer::disable);
        
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

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedOrigin("http://localhost:5000");
        corsConfiguration.addAllowedHeader("*");
        corsConfiguration.addAllowedMethod("*");
        corsConfiguration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource urlBasedCorsConfigurationSource = new UrlBasedCorsConfigurationSource();
        urlBasedCorsConfigurationSource.registerCorsConfiguration("/api/**", corsConfiguration);
        return new CorsFilter(urlBasedCorsConfigurationSource);
    } 
    
    // @Bean
    // public JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint() {
    //     return new JwtAuthenticationEntryPoint();
    // }
}
