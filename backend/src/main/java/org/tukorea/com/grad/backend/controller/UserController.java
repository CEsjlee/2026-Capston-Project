package org.tukorea.com.grad.backend.controller;


import org.tukorea.com.grad.backend.dto.UserProfileDto;
import org.tukorea.com.grad.backend.entity.User;
import org.tukorea.com.grad.backend.entity.UserProfile;
import org.tukorea.com.grad.backend.repository.UserProfileRepository;
import org.tukorea.com.grad.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    // 프로필 저장 및 수정 (PUT /api/user/profile)
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody UserProfileDto request,
            @AuthenticationPrincipal UserDetails userDetails // 현재 로그인한 사람 정보
    ) {
        // 1. 토큰에서 이메일 꺼내서 유저 찾기
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 2. 이미 프로필이 있으면 가져오고, 없으면 새로 만들기
        UserProfile profile = userProfileRepository.findByUser(user)
                .orElse(UserProfile.builder().user(user).build());

        // 3. 정보 업데이트 (리스트는 콤마로 합쳐서 저장)
        String coursesStr = (request.getCourses() != null) ? String.join(",", request.getCourses()) : "";
        
        profile.updateProfile(
                request.getGrade(),
                request.getMajor(),
                request.getInterest(),
                coursesStr,
                request.getProjects(),
                request.getGpa(),
                request.getCertificates(),
                request.getLanguageScore()
        );

        // 4. 저장
        userProfileRepository.save(profile);

        return ResponseEntity.ok(Map.of("message", "프로필 저장 성공"));
    }
}
