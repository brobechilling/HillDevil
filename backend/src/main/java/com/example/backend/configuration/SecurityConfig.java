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

@Configuration
@EnableWebSecurity
public class SecurityConfig {


    private final String[] PUBLIC_ENDPOINTS = {"/api/auth/token", "/api/auth/logout", "/api/auth/refresh", "/api/users/signup", "/api/payments/**", "/api/subscriptions/**", "/api/restaurants/paginated", "/api/staff/**",  "/api/packages/**", "/api/branches/**", "/api/public/**", "/api/public/tables/**", "/api/users/mail/**", "/api/users/forgetpass", "/api/orderlines/**/**", "/api/branch-menu-items/branch/**", "/api/branch-menu-items/guest/branch/**", "/api/menu-items/customization/**", "/api/order-items/**"};
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
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // allow preflight request in local
                .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                
                // User API
                .requestMatchers(HttpMethod.GET, "/api/users/{userId}").hasAnyRole(RoleName.ADMIN.name(), RoleName.RESTAURANT_OWNER.name())
                .requestMatchers(HttpMethod.PUT, "/api/users").hasAnyRole(RoleName.ADMIN.name(), RoleName.RESTAURANT_OWNER.name())
                .requestMatchers(HttpMethod.POST, "/api/users/changepass").hasAnyRole(RoleName.ADMIN.name(), RoleName.RESTAURANT_OWNER.name())
                .requestMatchers("/api/users/**").hasAnyRole(RoleName.ADMIN.name()) 

                // Role API
                .requestMatchers("/api/roles/**").hasAnyRole(RoleName.ADMIN.name())

                // Table API - Manager, waiter và owner được update status
                .requestMatchers(HttpMethod.PATCH, "/api/owner/tables/*/status").hasAnyRole(RoleName.RESTAURANT_OWNER.name(), RoleName.BRANCH_MANAGER.name(), RoleName.WAITER.name())
                .requestMatchers(HttpMethod.PUT, "/api/owner/tables/*").hasAnyRole(RoleName.RESTAURANT_OWNER.name(), RoleName.BRANCH_MANAGER.name(), RoleName.WAITER.name())
                .requestMatchers(HttpMethod.GET, "/api/owner/tables/**").hasAnyRole(RoleName.RESTAURANT_OWNER.name(), RoleName.BRANCH_MANAGER.name(), RoleName.WAITER.name())
                .requestMatchers("/api/owner/tables/**").hasAnyRole(RoleName.RESTAURANT_OWNER.name(), RoleName.BRANCH_MANAGER.name())
                
                // Area API
                .requestMatchers(HttpMethod.GET, "/api/owner/areas").hasAnyRole(RoleName.RESTAURANT_OWNER.name(), RoleName.BRANCH_MANAGER.name(), RoleName.WAITER.name())
                .requestMatchers("/api/owner/areas/**").hasAnyRole(RoleName.RESTAURANT_OWNER.name(), RoleName.BRANCH_MANAGER.name())

                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll());

            // config jwt authentication provider so that authentication filter can check the Authorization: Bearer token in the header of the request
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
