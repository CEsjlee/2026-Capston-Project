package org.tukorea.com.grad.backend.controller;


//필요한 부품들(Import) 추가됨
import org.tukorea.com.grad.backend.dto.LoginRequestDto;
import org.tukorea.com.grad.backend.dto.SignupRequestDto;
import org.tukorea.com.grad.backend.entity.Role;
import org.tukorea.com.grad.backend.entity.User;
import org.tukorea.com.grad.backend.jwt.JwtTokenProvider; // ★ 아까 만든 토큰 기계
import org.tukorea.com.grad.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

 private final UserRepository userRepository;
 private final JwtTokenProvider jwtTokenProvider; // ★ [추가] 토큰 생성기 주입
 
 // 비밀번호 암호화기
 private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

 // 1. 회원가입 기능 (기존과 동일)
 @PostMapping("/signup")
 public ResponseEntity<?> signup(@RequestBody SignupRequestDto request) {
     
     if (userRepository.findByEmail(request.getEmail()).isPresent()) {
         return ResponseEntity.badRequest().body("이미 가입된 이메일입니다.");
     }

     User user = User.builder()
             .email(request.getEmail())
             .password(passwordEncoder.encode(request.getPassword()))
             .name(request.getName())
             .role(Role.USER)
             .build();

     userRepository.save(user);

     return ResponseEntity.ok(Map.of("message", "가입 성공"));
 }

 // 2. ★ [추가] 로그인 기능 (새로 생긴 부분)
 @PostMapping("/login")
 public ResponseEntity<?> login(@RequestBody LoginRequestDto request) {
     
     // (1) 이메일로 사용자 찾기 (없으면 에러)
     User user = userRepository.findByEmail(request.getEmail())
             .orElseThrow(() -> new IllegalArgumentException("가입되지 않은 이메일입니다."));

     // (2) 비밀번호 확인 (입력 비번 vs DB 비번 비교)
     if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
         return ResponseEntity.badRequest().body("비밀번호가 틀렸습니다.");
     }

     // (3) 토큰 생성 (입장권 발급)
     String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole().name());

     // (4) 결과 반환 (토큰을 줌)
     return ResponseEntity.ok(Map.of("message", "로그인 성공",
             "token", token
    	        ));
    	    }
    	}