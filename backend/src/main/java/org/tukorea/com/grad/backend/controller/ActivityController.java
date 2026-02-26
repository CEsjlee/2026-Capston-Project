package org.tukorea.com.grad.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // ★ 추가
import org.springframework.web.bind.annotation.*;
import org.tukorea.com.grad.backend.dto.RoadmapRequestDto;
import org.tukorea.com.grad.backend.entity.ActivityRecommendation; // ★ 추가
import org.tukorea.com.grad.backend.service.ActivityService;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/activity")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityController {

    private final ActivityService activityService;

    // 1. 활동 추천 및 DB 저장 (Authentication 추가)
    @PostMapping("/recommend")
    public ResponseEntity<Map<String, Object>> recommendActivity(
            @RequestBody RoadmapRequestDto request,
            Authentication authentication) { // ★ 로그인한 유저 정보를 시큐리티에서 가져옴
        
        String email = authentication.getName(); // 유저 이메일 추출
        log.info("활동 추천 요청 - 사용자: {}, 전공: {}, 직무: {}", email, request.getMajor(), request.getTargetJob());

        // 서비스에 '이메일'도 같이 넘겨줘야 DB 저장이 됩니다.
        Map<String, Object> result = activityService.recommendActivities(request, email);
        return ResponseEntity.ok(result);
    }

    // 2. [신규 추가] DB에 저장된 내 활동 리스트 가져오기
    // 프론트엔드가 페이지를 새로고침했을 때 DB에서 데이터를 다시 불러오기 위해 필요합니다.
    @GetMapping("/my-list")
    public ResponseEntity<List<ActivityRecommendation>> getMyList(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(activityService.getMyActivities(email));
    }
}