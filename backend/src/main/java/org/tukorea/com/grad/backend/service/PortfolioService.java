package org.tukorea.com.grad.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.tukorea.com.grad.backend.dto.PortfolioDto;
import org.tukorea.com.grad.backend.entity.Portfolio;
import org.tukorea.com.grad.backend.entity.Roadmap;
import org.tukorea.com.grad.backend.entity.User;
import org.tukorea.com.grad.backend.repository.PortfolioRepository;
import org.tukorea.com.grad.backend.repository.RoadmapRepository;
import org.tukorea.com.grad.backend.repository.UserRepository;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioService {

    @Value("${openai.api.key}")
    private String apiKey;

    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;
    private final RoadmapRepository roadmapRepository;

    // 1. 조회
    @Transactional(readOnly = true)
    public PortfolioDto getMyPortfolio(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return portfolioRepository.findByUser(user)
                .map(p -> PortfolioDto.builder()
                        .intro(p.getIntro())
                        .stack(p.getStack())
                        .projects(p.getProjects())
                        .activities(p.getActivities())
                        .build())
                .orElse(new PortfolioDto("", "", "", ""));
    }

    // 2. 저장
    @Transactional
    public void savePortfolio(String email, PortfolioDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Portfolio portfolio = portfolioRepository.findByUser(user)
                .orElse(Portfolio.builder().user(user).build());

        portfolio.setIntro(dto.getIntro());
        portfolio.setStack(dto.getStack());
        portfolio.setProjects(dto.getProjects());
        portfolio.setActivities(dto.getActivities());

        portfolioRepository.save(portfolio);
    }

    // 3. AI 가이드라인 생성 (Guideline)
    public String generateAiContent(String email, String section) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Roadmap roadmap = roadmapRepository.findByUser(user).orElse(null);

        String context = (roadmap != null) 
            ? String.format("전공: %s, 목표직무: %s, 보유기술: %s, 주요경험: %s", 
                roadmap.getMajor(), roadmap.getTargetJob(), roadmap.getTechStacks(), roadmap.getProjects())
            : "사용자 정보: 컴퓨터공학 전공생";

        
        String prompt = String.format(
            "너는 IT 취업 전문 멘토야. 사용자의 정보[%s]를 바탕으로 포트폴리오의 '%s' 섹션을 작성하기 위한 **상세 가이드라인(Guideline)**을 작성해줘.\n\n" +
            "**[작성 조건]**\n" +
            "1. 문장을 완성해주기보다는, 사용자가 내용을 채워 넣을 수 있는 **구체적인 질문과 템플릿** 형태로 작성할 것.\n" +
            "2. **STAR 기법(Situation, Task, Action, Result)**을 적용하여 논리적인 구조를 잡을 것.\n" +
            "3. 사용자의 경험(주요경험)을 언급하며 '이 부분에는 ~~~한 내용을 수치와 함께 적으세요'라고 조언할 것.\n" +
            "4. 서론 없이 바로 가이드라인 본문만 출력할 것.\n\n" +
            "**[출력 예시] (반드시 이 형태로 출력할 것)**\n" +
            "💡 작성 가이드: [프로젝트명]\n" +
            "1. Situation (배경)\n" +
            "- (질문) ~~~ 프로젝트를 하게 된 계기는 무엇인가요?\n" +
            "- (작성 팁) 팀 규모와 본인의 역할을 명시하세요.\n\n" +
            "2. Task (문제)\n" +
            "- (질문) 개발 과정에서 마주친 가장 큰 기술적 난관은 무엇이었나요?\n\n" +
            "3. Action (해결)\n" +
            "- (질문) [사용자 기술]을 활용해 어떻게 문제를 해결했나요?\n" +
            "- (작성 팁) 코드 레벨에서의 고민을 구체적으로 적으세요.\n\n" +
            "4. Result (성과)\n" +
            "- (질문) 성능이 몇 %% 향상되었나요? 정량적 수치를 포함하세요.",
            context, convertSectionName(section)
        );

        return callGpt(prompt);
    }

    private String convertSectionName(String sectionId) {
        switch(sectionId) {
            case "intro": return "자기소개";
            case "stack": return "기술 스택";
            case "projects": return "프로젝트 경험";
            case "activities": return "대외활동 및 수상";
            default: return "포트폴리오";
        }
    }

    private String callGpt(String prompt) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-4o-mini");
            body.put("messages", List.of(Map.of("role", "user", "content", prompt)));
            body.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity("https://api.openai.com/v1/chat/completions", entity, String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            log.error("GPT 호출 실패", e);
            return "AI 생성 중 오류가 발생했습니다. 다시 시도해주세요.";
        }
    }
}