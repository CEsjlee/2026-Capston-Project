package org.tukorea.com.grad.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tukorea.com.grad.backend.dto.LoginRequestDto;
import org.tukorea.com.grad.backend.dto.SignupRequestDto;
import org.tukorea.com.grad.backend.service.AuthService;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth") // 프론트엔드 api/auth.js 주소와 일치
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequestDto request) {
        authService.signup(request);
        return ResponseEntity.ok("회원가입 성공");
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }
}