package org.tukorea.com.grad.backend.controller;

import org.tukorea.com.grad.backend.dto.FeedbackDto;
import org.tukorea.com.grad.backend.entity.Feedback;
import org.tukorea.com.grad.backend.entity.User;
import org.tukorea.com.grad.backend.repository.FeedbackRepository;
import org.tukorea.com.grad.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    // 1. 피드백 조회 (GET /api/feedback)
    @GetMapping
    public ResponseEntity<?> getFeedback(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        // DB에서 찾고, 없으면 "데이터 없음(null)" 상태로 보냄
        // (프론트엔드는 null이 오면 '분석 중'이나 '데이터 없음' 화면을 띄워야 함)
        Feedback feedback = feedbackRepository.findByUser(user).orElse(null);

        if (feedback == null) {
            return ResponseEntity.ok(Map.of("message", "아직 생성된 피드백이 없습니다."));
        }

        return ResponseEntity.ok(feedback);
    }

    // 2. 피드백 저장/생성 (POST /api/feedback)
    // (원래는 AI가 분석해서 이 API를 호출해줘야 함. 지금은 프론트/포스트맨 테스트용)
    @PostMapping
    public ResponseEntity<?> saveFeedback(
            @RequestBody FeedbackDto request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        Feedback feedback = feedbackRepository.findByUser(user)
                .orElse(Feedback.builder().user(user).build());

        // 받은 데이터 그대로 저장
        feedback.updateFeedback(
                request.getAchievements(),
                request.getAnalysis(),
                request.getRecommendations()
        );

        feedbackRepository.save(feedback);
        return ResponseEntity.ok(Map.of("message", "피드백 저장 성공"));
    }
}