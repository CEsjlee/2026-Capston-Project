package org.tukorea.com.grad.backend.jwt;


import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Collections;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenProvider {

    private final String SECRET_KEY = "mySuperSecretKeyForGraduationProjectDoNotHackMePlease";
    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    private final long TOKEN_VALID_TIME = 1000L * 60 * 30; // 30분

    // 1. 토큰 생성
    public String createToken(String email, String role) {
        Claims claims = Jwts.claims().setSubject(email);
        claims.put("role", role);

        Date now = new Date();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + TOKEN_VALID_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. [추가됨] 토큰에서 인증 정보(누구인지) 꺼내기
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody();

        String email = claims.getSubject();
        String role = claims.get("role", String.class);

        // 스프링 시큐리티가 알아들을 수 있는 형태로 변환
        UserDetails principal = new User(email, "", 
                Collections.singletonList(new SimpleGrantedAuthority(role)));
        
        return new UsernamePasswordAuthenticationToken(principal, "", principal.getAuthorities());
    }

    // 3. [추가됨] 토큰이 유효한지 검사
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}