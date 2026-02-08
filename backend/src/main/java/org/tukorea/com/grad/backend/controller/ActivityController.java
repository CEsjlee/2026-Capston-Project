package org.tukorea.com.grad.backend.controller;

import org.tukorea.com.grad.backend.entity.Activity;
import org.tukorea.com.grad.backend.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityRepository activityRepository;

    // 1. 추천 활동 리스트 조회
    @GetMapping("/activities")
    public ResponseEntity<?> getActivities(@RequestParam(required = false) String category) {
        
        // 이제 "없으면 만든다"는 로직 없이, 있는 그대로 조회만 합니다.
        // 데이터가 없으면 빈 리스트([])가 나가는 게 정상입니다.
        List<Activity> activities;
        if (category == null || category.equals("전체")) {
            activities = activityRepository.findAll();
        } else {
            activities = activityRepository.findByType(category);
        }

        return ResponseEntity.ok(activities);
    }

    // 2. 산업 동향 뉴스 조회
    @GetMapping("/trends")
    public ResponseEntity<?> getTrends() {
        // (참고: 뉴스는 보통 크롤링 서버에서 가져오거나 별도 DB를 씁니다.
        // 지금은 고정된 데이터를 응답하는 방식이므로 그대로 두셔도 됩니다.)
        List<Map<String, String>> trends = Arrays.asList(
            Map.of("category", "채용", "title", "2026년 AI 개발자 수요 급증", "date", "02-02", "source", "Tech News"),
            Map.of("category", "기술", "title", "Spring Boot 3.5 업데이트 소식", "date", "01-28", "source", "Dev Blog"),
            Map.of("category", "산업", "title", "반도체 업계, 하반기 공채 규모 확대", "date", "01-15", "source", "Biz News")
        );

        return ResponseEntity.ok(trends);
    }
}