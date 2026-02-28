package org.tukorea.com.grad.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.tukorea.com.grad.backend.dto.LoginRequestDto;
import org.tukorea.com.grad.backend.dto.SignupRequestDto;
import org.tukorea.com.grad.backend.service.AuthService;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    private final AuthService authService;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignupRequestDto request) {
        authService.signup(request);
        return ResponseEntity.ok("회원가입 성공");
    }

    // 🔥 수정됨: 로그인 (에러 발생 시 프론트엔드가 읽을 수 있게 메시지 반환)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (RuntimeException e) {
            // AuthService에서 던진 "가입되지 않은 이메일" 또는 "비밀번호 불일치" 에러를 잡아서 프론트로 전달
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 비밀번호 변경
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request, Authentication authentication) {
        try {
            String email = authentication.getName(); // 토큰에서 이메일 추출
            authService.changePassword(email, request.get("currentPassword"), request.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 변경되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 회원 탈퇴
    @DeleteMapping("/withdrawal")
    public ResponseEntity<?> withdrawUser(Authentication authentication) {
        try {
            String email = authentication.getName(); // 토큰에서 이메일 추출
            authService.withdrawUser(email);
            return ResponseEntity.ok(Map.of("message", "회원 탈퇴가 완료되었습니다."));
        } catch (Exception e) {
            log.error("회원 탈퇴 에러", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "탈퇴 처리 중 오류가 발생했습니다."));
        }
    }

    // 이름 + 이메일 확인 (비밀번호 재설정 1단계)
    @PostMapping("/check-user")
    public ResponseEntity<?> checkUser(@RequestBody Map<String, String> request) {
        try {
            authService.checkUser(
                    request.get("name"),
                    request.get("email")
            );
            return ResponseEntity.ok(Map.of("message", "사용자 확인 완료"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }


    // 이름 + 이메일 기반 비밀번호 재설정 (2단계)
    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            authService.resetPassword(
                    request.get("name"),
                    request.get("email"),
                    request.get("newPassword")
            );
            return ResponseEntity.ok(Map.of("message", "비밀번호가 성공적으로 재설정되었습니다."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}