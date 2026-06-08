package com.lingyue.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger Configuration
 * 
 * Access the API documentation at:
 * - Swagger UI: http://localhost:8088/swagger-ui.html
 * - OpenAPI JSON: http://localhost:8088/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";
        
        return new OpenAPI()
            .info(new Info()
                .title("灵月仙途 API")
                .version("1.0.0")
                .description("灵月仙途游戏后端 API 文档 - 一个修仙题材的网页游戏后端服务")
                .termsOfService("http://swagger.io/terms/")
                .contact(new Contact()
                    .name("灵月仙途开发团队")
                    .email("support@lingyuexiantu.com"))
                .license(new License()
                    .name("Apache 2.0")
                    .url("http://springdoc.org")))
            .servers(List.of(
                new Server()
                    .url("http://localhost:8088/api")
                    .description("Development server"),
                new Server()
                    .url("http://api.lingyuexiantu.com/api")
                    .description("Production server")))
            .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
            .components(new io.swagger.v3.oas.models.Components()
                .addSecuritySchemes(securitySchemeName,
                    new SecurityScheme()
                        .name(securitySchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Enter JWT token in the format: Bearer {token}")));
    }
}
