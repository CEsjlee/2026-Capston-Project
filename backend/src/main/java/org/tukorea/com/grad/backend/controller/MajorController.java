package org.tukorea.com.grad.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.tukorea.com.grad.backend.dto.RoadmapRequestDto;
import org.tukorea.com.grad.backend.service.MajorService;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/major")
@RequiredArgsConstructor
// [B팀원] 프론트엔드 포트(3000, 5173) 모두 허용하여 통신 에러 방지
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MajorController {

    private final MajorService majorService;

    /**
     * 1. AI 로드맵 생성 및 분석
     */
    @PostMapping("/analyze")
    public ResponseEntity<?> analyze(
            @RequestBody RoadmapRequestDto request,
            Authentication authentication) {
        
        // [B팀원] 인증 정보 Null 체크 (토큰 없이 요청 시 500 에러 방지)
        if (authentication == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }
        
        String email = authentication.getName();
        log.info("로드맵 분석 요청 - 사용자: {}", email);
        return ResponseEntity.ok(majorService.analyze(request, email));
    }

    /**
     * 2. 내 로드맵 정보 불러오기
     */
    @GetMapping("/my-roadmap")
    public ResponseEntity<?> getMyRoadmap(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        
        String email = authentication.getName();
        RoadmapRequestDto result = majorService.getMyRoadmap(email);
        
        if (result == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }

    /**
     * 3. [A팀원] 로드맵 진행도(체크박스) 업데이트
     */
    @PostMapping("/update-progress")
    public ResponseEntity<?> updateProgress(
            Authentication authentication, 
            @RequestBody Map<String, String> payload) {
        
        if (authentication == null) return ResponseEntity.status(401).build();
        
        String email = authentication.getName();
        String roadmapJson = payload.get("roadmapJson");
        
        majorService.updateRoadmapProgress(email, roadmapJson);
        return ResponseEntity.ok("진행도 저장 완료");
    }

    /**
     * 4. [A팀원] 실시간 뉴스 검색
     */
    @GetMapping("/news")
    public ResponseEntity<List<Map<String, String>>> searchNews(@RequestParam String keyword) {
        log.info("뉴스 검색 요청 keyword: {}", keyword);
        return ResponseEntity.ok(majorService.getMajorNews(keyword));
    }

    /**
     * 5. [A팀원] 학기 결산 및 AI 피드백 갱신
     */
    @PostMapping("/finish-semester")
    public ResponseEntity<?> finishSemester(
            Authentication authentication, 
            @RequestBody Map<String, String> payload) {
        
        if (authentication == null) return ResponseEntity.status(401).build();
        
        String email = authentication.getName();
        String roadmapJson = payload.get("roadmapJson");
        String finishedGrade = payload.get("finishedGrade"); // 예: "4학년 1학기"
        
        majorService.refreshFeedback(email, roadmapJson, finishedGrade);
        
        return ResponseEntity.ok("결산 및 피드백 갱신 완료");
    }
}