package com.lingyue.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtAuthFilter jwtAuthFilter;
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        configuration.addAllowedOriginPattern("http://localhost:*");
        configuration.addAllowedOriginPattern("http://127.0.0.1:*");
        configuration.addAllowedOriginPattern("http://192.168.*:*");
        configuration.addAllowedOriginPattern("http://10.*:*");
        configuration.addAllowedOriginPattern("http://172.16.*:*");
        configuration.addAllowedOriginPattern("http://172.17.*:*");
        configuration.addAllowedOriginPattern("http://172.18.*:*");
        configuration.addAllowedOriginPattern("http://172.19.*:*");
        configuration.addAllowedOriginPattern("http://172.2*.*:*");
        configuration.addAllowedOriginPattern("http://172.30.*:*");
        configuration.addAllowedOriginPattern("http://172.31.*:*");
        
        // 明确允许凭证
        configuration.setAllowCredentials(true);
        
        // 允许的请求方法
        configuration.addAllowedMethod("GET");
        configuration.addAllowedMethod("POST");
        configuration.addAllowedMethod("PUT");
        configuration.addAllowedMethod("DELETE");
        configuration.addAllowedMethod("OPTIONS");
        configuration.addAllowedMethod("PATCH");
        
        // 允许的请求头
        configuration.addAllowedHeader("*");
        configuration.addExposedHeader("Authorization");
        configuration.addExposedHeader("X-Admin-ID");
        configuration.addExposedHeader("X-Request-Timestamp");
        configuration.addExposedHeader("Access-Control-Allow-Origin");
        configuration.addExposedHeader("Access-Control-Allow-Credentials");
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 开发环境：允许所有 CORS 请求
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/role/create").permitAll()
                .requestMatchers("/sys/user/login").permitAll()
                .requestMatchers("/init/**").permitAll()
                .requestMatchers("/activity/status/**").permitAll()
                .requestMatchers("/activity/activity-info/**").permitAll()
                .requestMatchers("/activity/activity-claim/**").authenticated()
                .requestMatchers("/activity/{id}/participate").authenticated()
                .requestMatchers(HttpMethod.POST, "/activity/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/activity/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/activity/**").authenticated()
                .requestMatchers("/announcement/**").permitAll()
                .requestMatchers("/leaderboard/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/body-cultivation/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/body-cultivation/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/config/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/config/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/config/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/config/**").hasRole("ADMIN")
                .requestMatchers("/resource/**").permitAll()
                .requestMatchers("/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/cultivation/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/cultivation/**").authenticated()
                .requestMatchers("/sql/**").hasRole("ADMIN")
                .requestMatchers("/db-fix/**").hasRole("ADMIN")
                .requestMatchers("/task/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/achievement/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/achievement/**").authenticated()
                .requestMatchers("/mail/**").authenticated()
                .requestMatchers("/friend/**").authenticated()
                .requestMatchers("/inventory/**").authenticated()
                .requestMatchers("/item/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/role/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/role/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/role/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/role/**").authenticated()
                .requestMatchers("/role-asset/**").authenticated()
                .requestMatchers("/role-assets/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/role-skill/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/role-skill/**").authenticated()
                .requestMatchers("/role-realm/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/role-stats/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/role-stats/**").authenticated()
                .requestMatchers("/attributes/**").permitAll()
                .requestMatchers("/equipment/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/skill/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/skill/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/skill/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/skill/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/skill-type/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/skill-type/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/skill-type/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/skill-type/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/asset-type/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/asset-type/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/asset-type/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/asset-type/**").hasRole("ADMIN")
                .requestMatchers("/test-data/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/mall/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/mall/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/clan/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/clan/**").authenticated()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/sys/**").hasRole("ADMIN")
                .requestMatchers("/trade/**").authenticated()
                .requestMatchers("/payment/**").authenticated()
                .requestMatchers("/combat/**").authenticated()
                .requestMatchers("/checkin/**").authenticated()
                .requestMatchers("/smart-db-fix/**").hasRole("ADMIN")
                .requestMatchers("/fix/**").hasRole("ADMIN")
                .requestMatchers("/logs/**").hasRole("ADMIN")
                .requestMatchers("/game/user/**").hasRole("ADMIN")
                .requestMatchers("/world/admin/**").hasRole("ADMIN")
                .requestMatchers("/statistics/**").permitAll()
                .requestMatchers("/server/**").permitAll()
                .requestMatchers("/reward/**").authenticated()
                .requestMatchers("/role/clans/**").authenticated()
                .requestMatchers("/assets/**").authenticated()
                .requestMatchers("/body-training/**").authenticated()
                .requestMatchers("/map-sync/**").authenticated()
                .anyRequest().authenticated()
            );
        
        // 添加 JWT 过滤器
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
