package org.tukorea.com.grad.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.tukorea.com.grad.backend.dto.PortfolioDto;
import org.tukorea.com.grad.backend.service.PortfolioService;

import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class PortfolioController {

    private final PortfolioService portfolioService;

    // 조회
    @GetMapping
    public ResponseEntity<PortfolioDto> getPortfolio(Authentication auth) {
        return ResponseEntity.ok(portfolioService.getMyPortfolio(auth.getName()));
    }

    // 저장
    @PostMapping("/save")
    public ResponseEntity<String> savePortfolio(@RequestBody PortfolioDto dto, Authentication auth) {
        portfolioService.savePortfolio(auth.getName(), dto);
        return ResponseEntity.ok("저장되었습니다.");
    }

    // AI 생성 요청
    @PostMapping("/ai-generate")
    public ResponseEntity<Map<String, String>> generateAi(@RequestBody Map<String, String> request, Authentication auth) {
        String section = request.get("section"); // intro, projects 등
        String content = portfolioService.generateAiContent(auth.getName(), section);
        return ResponseEntity.ok(Map.of("content", content));
    }
}