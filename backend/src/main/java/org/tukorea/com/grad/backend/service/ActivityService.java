package org.tukorea.com.grad.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // [추가]
import org.springframework.web.client.RestTemplate;
import org.tukorea.com.grad.backend.dto.RoadmapRequestDto;
import org.tukorea.com.grad.backend.entity.ActivityRecommendation; // [추가]
import org.tukorea.com.grad.backend.entity.User;                   // [추가]
import org.tukorea.com.grad.backend.repository.ActivityRepository; // [추가]
import org.tukorea.com.grad.backend.repository.UserRepository;     // [추가]

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityService {

    @Value("${openai.api.key}")
    private String apiKey;

    // DB 접근을 위한 리포지토리 추가
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // [변경] 이메일을 파라미터로 받아서 저장까지 수행
    @Transactional
    public Map<String, Object> recommendActivities(RoadmapRequestDto request, String email) {
        
        // 1. 사용자 확인 (누구의 추천인지 알아야 저장하니까요)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + email));

        String systemRole = "너는 대학생 커리어 컨설턴트야. 사용자의 정보를 바탕으로 도전할 만한 대외활동, 공모전, 인턴십, 자격증을 추천해줘. 반드시 JSON 형식으로만 답변해.";
        
        String userPrompt = String.format(
            "나는 %s 전공 %s 학생이고, 목표는 %s야. 내가 가진 기술은 %s이고, 관심 기업은 %s야.\n" +
            "나에게 도움될 만한 활동 6개를 추천해줘.\n" +
            "[응답 규칙]\n" +
            "1. category는 반드시 'CONTEST', 'INTERN', 'CLUB', 'LICENSE' 중 하나여야 해.\n" +
            "2. dday는 'D-14' 또는 '3월 중순'처럼 마감 기한을 적어줘.\n" +
            "3. tags는 활동의 핵심 키워드 2개를 배열로 넣어줘.\n\n" +
            "[JSON 포맷]\n" +
            "{\n" +
            "  \"activities\": [\n" +
            "    { \"category\": \"분류\", \"title\": \"활동명\", \"description\": \"추천 이유\", \"dday\": \"마감일\", \"tags\": [\"태그1\", \"태그2\"], \"link\": \"https://www.google.com/search?q=활동명\" }\n" +
            "  ]\n" +
            "}",
            request.getMajor(), request.getGrade(), request.getTargetJob(),
            request.getTechStacks(), request.getTargetCompany()
        );

        // 2. GPT에게 물어보기
        Map<String, Object> result = fetchGptResponse(systemRole, userPrompt);

        // 3. 받은 결과를 DB에 저장하기 (여기가 핵심!)
        saveActivitiesToDb(user, result);

        return result;
    }

    // [신규] 저장된 내 활동 리스트 불러오기
    @Transactional(readOnly = true)
    public List<ActivityRecommendation> getMyActivities(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return activityRepository.findByUserOrderByCreatedAtDesc(user);
    }

    // [신규] DB 저장 헬퍼 함수
    private void saveActivitiesToDb(User user, Map<String, Object> result) {
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> activities = (List<Map<String, Object>>) result.get("activities");
            if (activities == null || activities.isEmpty()) return;

            // 기존 추천 기록 삭제 (최신 것만 남기기 위함, 원치 않으면 이 줄 삭제)
            activityRepository.deleteByUser(user);

            for (Map<String, Object> act : activities) {
                ActivityRecommendation entity = ActivityRecommendation.builder()
                        .user(user)
                        .category((String) act.get("category"))
                        .title((String) act.get("title"))
                        .description((String) act.get("description"))
                        .link((String) act.get("link"))
                        .build();
                activityRepository.save(entity);
            }
            log.info("사용자 {}의 추천 활동 {}개가 DB에 저장되었습니다.", user.getEmail(), activities.size());

        } catch (Exception e) {
            log.error("DB 저장 중 오류 발생: {}", e.getMessage());
        }
    }

    private Map<String, Object> fetchGptResponse(String systemRole, String userPrompt) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-4o-mini");
            body.put("messages", Arrays.asList(
                    Map.of("role", "system", "content", systemRole),
                    Map.of("role", "user", "content", userPrompt)
            ));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                "https://api.openai.com/v1/chat/completions", entity, String.class
            );

            JsonNode rootNode = objectMapper.readTree(response.getBody());
            String content = rootNode.path("choices").get(0).path("message").path("content").asText();
            
            if (content.contains("{")) {
                content = content.substring(content.indexOf("{"), content.lastIndexOf("}") + 1);
            }
            
            return objectMapper.readValue(content, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("활동 추천 GPT 요청 중 에러 발생: {}", e.getMessage());
            return Map.of("activities", Collections.emptyList());
        }
    }
}