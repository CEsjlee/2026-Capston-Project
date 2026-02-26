package org.tukorea.com.grad.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.tukorea.com.grad.backend.jwt.JwtAuthenticationFilter;
import org.tukorea.com.grad.backend.jwt.JwtTokenProvider;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    // ✅ 비밀번호 암호화 빈 등록 (BCrypt 사용)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable) // CSRF 비활성화 (Stateless 구조)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // [B팀원 추가] Preflight(OPTIONS) 요청 전체 허용
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() 
                
                // [공통] 로그인, 회원가입 관련 엔드포인트 누구나 접근 가능
                .requestMatchers("/api/auth/**", "/api/user/**").permitAll() 
                
                // [A팀원] 뉴스 검색은 비로그인 상태에서도 허용
                .requestMatchers("/api/news/**").permitAll()

                // [B팀원] 개발/기능 테스트용 API 및 H2 콘솔 일시 허용
                .requestMatchers("/api/major/**", "/api/notes/**", "/api/ai/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()

                // [A팀원 핵심] 그 외 모든 요청(활동 추천 등)은 로그인(인증) 필수!
                .anyRequest().authenticated()
            )
            // [B팀원 추가] H2-Console 사용을 위한 FrameOptions 설정
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            
            // ✅ JWT 필터를 시큐리티 필터 체인 앞에 추가
            .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // [B팀원] 프론트엔드 다양한 개발 환경 포트(3000, 5173) 모두 수용
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000", 
            "http://localhost:5173", 
            "http://43.201.97.xxx" 
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        // [공통] 클라이언트에서 Authorization 및 accessToken 헤더를 읽을 수 있게 노출
        configuration.setExposedHeaders(Arrays.asList("Authorization", "accessToken")); 
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}