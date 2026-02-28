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
import org.tukorea.com.grad.backend.repository.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    
    // 🔥 탈퇴 시 외래키 에러를 막기 위해 모든 연관 리포지토리 추가
    private final RoadmapRepository roadmapRepository;
    private final ActivityRepository activityRepository;
    private final PortfolioRepository portfolioRepository;
    private final StudyNoteRepository studyNoteRepository;
    
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // 1. 회원가입
    @Transactional
    public void signup(SignupRequestDto request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(Role.USER)
                .build();

        userRepository.save(user);
        log.info("회원가입 성공: {}", request.getEmail());
    }

    // 2. 로그인
    @Transactional
    public Map<String, String> login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole().name(), user.getName());

        Map<String, String> response = new HashMap<>();
        response.put("accessToken", token);
        response.put("userName", user.getName());
        
        return response;
    }

    // 3. 비밀번호 직접 변경
    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }
        
        // 새 비밀번호 암호화 후 저장
        user.setPassword(passwordEncoder.encode(newPassword));
        log.info("[{}] 유저의 비밀번호가 변경되었습니다.", email);
    }

    // 4. 회원 탈퇴 (관련된 모든 데이터 연쇄 삭제)
    @Transactional
    public void withdrawUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        // 🚨 유저 삭제 전, FK로 묶인 하위 데이터들을 먼저 지워야 DB 에러가 안 납니다!
        activityRepository.deleteByUser(user);
        portfolioRepository.deleteByUser(user);
        roadmapRepository.deleteByUser(user);
        studyNoteRepository.deleteByUser(user);

        // 마지막으로 유저 본인 삭제
        userRepository.delete(user);
        log.info("🗑️ [{}] 유저의 모든 데이터가 삭제(탈퇴) 되었습니다.", email);
    }

    // 5. 이름 + 이메일 확인 (비밀번호 재설정 전 사용자 검증)
    @Transactional(readOnly = true)
    public void checkUser(String name, String email) {

        userRepository.findByEmailAndName(email, name)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 사용자가 없습니다."));

        log.info("비밀번호 재설정을 위한 사용자 확인 완료: {}", email);
    }


    // 6. 이름 + 이메일 기반 비밀번호 재설정
    @Transactional
    public void resetPassword(String name, String email, String newPassword) {

        User user = userRepository.findByEmailAndName(email, name)
                .orElseThrow(() -> new IllegalArgumentException("일치하는 사용자가 없습니다."));

        user.setPassword(passwordEncoder.encode(newPassword));

        log.info("[{}] 유저의 비밀번호가 재설정되었습니다.", email);
    }
}