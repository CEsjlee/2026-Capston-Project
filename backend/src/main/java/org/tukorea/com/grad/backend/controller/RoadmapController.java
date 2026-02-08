package org.tukorea.com.grad.backend.controller;



import org.tukorea.com.grad.backend.dto.RoadmapResponseDto;
import org.tukorea.com.grad.backend.entity.Roadmap;
import org.tukorea.com.grad.backend.entity.User;
import org.tukorea.com.grad.backend.entity.UserProfile;
import org.tukorea.com.grad.backend.repository.RoadmapRepository;
import org.tukorea.com.grad.backend.repository.UserProfileRepository;
import org.tukorea.com.grad.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/roadmap")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapRepository roadmapRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    // 1. 내 로드맵 조회 (GET /api/roadmap)
    @GetMapping
    public ResponseEntity<?> getMyRoadmap(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        // 로드맵이 있으면 가져오고, 없으면 에러 대신 "분석해주세요" 메시지 보내기 (혹은 빈 값)
        Roadmap roadmap = roadmapRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("아직 생성된 로드맵이 없습니다. '로드맵 생성' 버튼을 눌러주세요."));

        return ResponseEntity.ok(new RoadmapResponseDto(roadmap));
    }

    // 2. 로드맵 생성/새로고침 (POST /api/roadmap/refresh) - AI 분석 시뮬레이션
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshRoadmap(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        
        // 내 프로필 가져오기 (이걸 바탕으로 AI가 분석해야 함)
        UserProfile profile = userProfileRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("먼저 프로필(학년, 전공 등)을 설정해주세요."));

        // ★ 여기 원래 AI(ChatGPT) 호출 코드가 들어가야 함
        // 지금은 일단 "샘플 데이터"를 저장해서 프론트엔드 테스트를 돕습니다.
        
        // (샘플 데이터 생성)
        List<String> mockGoals = Arrays.asList("정보처리기사 취득", "알고리즘 문제 100개 풀기");
        List<String> mockCourses = Arrays.asList("데이터베이스응용", "캡스톤디자인");
        List<String> mockActivities = Arrays.asList("교내 해커톤 참여", "IT 동아리 활동");
        String mockAdvice = user.getName() + "님은 " + profile.getInterest() + " 직무에 적합합니다. 기초 CS 지식을 더 보강해보세요!";

        // DB에 저장 (있으면 업데이트, 없으면 생성)
        Roadmap roadmap = roadmapRepository.findByUser(user).orElse(
                Roadmap.builder().user(user).build()
        );
        
        roadmap.updateRoadmap(
                profile.getInterest(), // 목표 직무는 프로필의 관심 직무로 설정
                mockGoals,
                mockCourses,
                mockActivities,
                mockAdvice
        );

        roadmapRepository.save(roadmap);

        return ResponseEntity.ok(new RoadmapResponseDto(roadmap));
    }
}