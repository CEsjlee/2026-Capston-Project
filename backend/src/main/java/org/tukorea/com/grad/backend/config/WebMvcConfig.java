
package org.tukorea.com.grad.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 1. 모든 API 요청에 대해서
                .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://43.201.97.147") // 2. 이 주소(프론트엔드)에서 오는 건 허락해라
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 3. 이런 요청 방식을 허용한다
                .allowCredentials(true); // 4. 로그인 정보(쿠키 등)도 허용 (나중에 필요할 수 있음)
    }
}