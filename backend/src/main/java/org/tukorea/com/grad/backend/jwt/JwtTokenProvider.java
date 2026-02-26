package org.tukorea.com.grad.backend.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // 로그 출력을 위해 추가 (선택사항)
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Slf4j // 로그 사용 (선택)
@Component
@RequiredArgsConstructor // final 필드(userDetailsService) 자동 주입
public class JwtTokenProvider {

    // 1. 비밀키 설정 (32글자 이상 필수!)
    // 보안상 원래는 application.properties에 넣고 @Value로 가져와야 하지만, 편의상 여기에 둡니다.
    private final String SECRET_KEY = "mySuperSecretKeyForGraduationProjectDoNotHackMePlease";
    
    // 암호화 키 객체 생성
    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // 2. 토큰 유효 시간 (30분)
    private final long TOKEN_VALID_TIME = 1000L * 60 * 30;

    // 3. UserDetailsService 주입 (토큰에서 유저 정보를 찾아올 때 필요)
    // 스프링 시큐리티에서 유저 정보를 로드하는 서비스입니다. 
    // 만약 "Could not find bean" 에러가 나면 CustomUserDetailsService가 구현되어 있는지 확인해야 합니다.
    private final UserDetailsService userDetailsService;

    // ======================================
    // 1. 토큰 생성 (로그인 성공 시 호출)
    // ======================================
    public String createToken(String email, String role, String name) {
        Claims claims = Jwts.claims().setSubject(email); // 토큰의 주인을 이메일로 설정
        claims.put("role", role); // 권한 정보 저장
        claims.put("name", name); // 이름 정보 저장

        Date now = new Date();

        return Jwts.builder()
                .setClaims(claims) // 정보 저장
                .setIssuedAt(now) // 토큰 발행 시간 정보
                .setExpiration(new Date(now.getTime() + TOKEN_VALID_TIME)) // 만료 시간 설정
                .signWith(key, SignatureAlgorithm.HS256) // 암호화 알고리즘
                .compact();
    }

    // ======================================
    // 2. 인증 정보 조회 (필터에서 사용)
    // ======================================
    // 토큰 -> 인증 객체(Authentication) 변환
    public Authentication getAuthentication(String token) {
        // 토큰에서 이메일을 추출하여 DB에서 유저 정보를 가져옴
        UserDetails userDetails = userDetailsService.loadUserByUsername(this.getUserEmail(token));
        
        // 스프링 시큐리티가 인식할 수 있는 인증 객체 반환
        return new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
    }

    // ======================================
    // 3. 토큰에서 회원 이메일 추출
    // ======================================
    public String getUserEmail(String token) {
        // 토큰을 비밀키로 복호화해서 안의 내용(Claims) 중 Subject(이메일)를 꺼냄
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // ======================================
    // 4. 헤더에서 토큰 값 꺼내기
    // ======================================
    // "Authorization: Bearer abcd123..." -> "abcd123..." 만 추출
    public String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    // ======================================
    // 5. 토큰 유효성 검사
    // ======================================
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.info("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.info("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.info("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }
}