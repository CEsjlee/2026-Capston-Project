package org.tukorea.com.grad.backend.controller;

import org.tukorea.com.grad.backend.dto.PortfolioDto;
import org.tukorea.com.grad.backend.entity.Portfolio;
import org.tukorea.com.grad.backend.entity.User;
import org.tukorea.com.grad.backend.repository.PortfolioRepository;
import org.tukorea.com.grad.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;

    // 1. 내 포트폴리오 조회
    @GetMapping
    public ResponseEntity<?> getMyPortfolio(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        // DB에 있으면 가져오고, 없으면 빈 객체 반환 (테스트 데이터 X)
        Portfolio portfolio = portfolioRepository.findByUser(user)
                .orElse(Portfolio.builder().user(user).build());

        return ResponseEntity.ok(portfolio);
    }

    // 2. 포트폴리오 저장/수정
    @PutMapping
    public ResponseEntity<?> updatePortfolio(
            @RequestBody PortfolioDto request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        Portfolio portfolio = portfolioRepository.findByUser(user)
                .orElse(Portfolio.builder().user(user).build());

        // 실제 받은 데이터로 업데이트
        portfolio.updatePortfolio(
                request.getIntroduction(),
                request.getTechStack(),
                request.getProjects(),
                request.getContact()
        );

        portfolioRepository.save(portfolio);
        return ResponseEntity.ok(Map.of("message", "포트폴리오 저장 성공"));
    }

    // 3. AI 초안 생성 (현재는 빈 값 반환)
    @PostMapping("/ai-generate")
    public ResponseEntity<?> generateAiContent(@RequestBody PortfolioDto.AiRequest request) {
        
        // [TODO] 추후 여기에 ChatGPT API 연동 코드를 작성해야 합니다.
        // 현재는 외부 API가 연결되지 않았으므로 빈 문자열을 반환합니다.
        // 가짜 데이터(하드코딩된 자기소개서)는 삭제했습니다.
        String generatedContent = ""; 

        return ResponseEntity.ok(Map.of("suggestedContent", generatedContent));
    }
}