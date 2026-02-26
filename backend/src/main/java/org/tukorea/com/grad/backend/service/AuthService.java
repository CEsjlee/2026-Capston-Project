package org.tukorea.com.grad.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tukorea.com.grad.backend.dto.LoginRequestDto;
import org.tukorea.com.grad.backend.dto.SignupRequestDto;
import org.tukorea.com.grad.backend.entity.Role;
import org.tukorea.com.grad.backend.entity.User;
import org.tukorea.com.grad.backend.jwt.JwtTokenProvider;
import org.tukorea.com.grad.backend.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // 비밀번호 암호화 기계
    private final JwtTokenProvider jwtTokenProvider; // 토큰 생성 기계

    // 1. 회원가입 (DB에 저장)
    @Transactional
    public void signup(SignupRequestDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // ★ 암호화 필수
                .name(request.getName())
                .role(Role.USER) // 기본 권한 USER
                .build();

        userRepository.save(user); // ★ 여기서 DB에 저장됨!
        log.info("회원가입 성공: {}", request.getEmail());
    }

    // 2. 로그인 (토큰 발급)
    @Transactional
    public Map<String, String> login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 토큰 생성 (이메일, 권한, 이름)
        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole().name(), user.getName());

        Map<String, String> response = new HashMap<>();
        response.put("accessToken", token);
        response.put("userName", user.getName()); // 프론트 환영 메시지용 이름
        
        return response;
    }
}