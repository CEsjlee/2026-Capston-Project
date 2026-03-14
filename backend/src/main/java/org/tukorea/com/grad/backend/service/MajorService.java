package org.tukorea.com.grad.backend.service;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.tukorea.com.grad.backend.dto.RoadmapRequestDto;
import org.tukorea.com.grad.backend.entity.Roadmap;
import org.tukorea.com.grad.backend.entity.User;
import org.tukorea.com.grad.backend.repository.RoadmapRepository;
import org.tukorea.com.grad.backend.repository.UserRepository;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MajorService {

    @Value("${openai.api.key}")
    private String apiKey;

    private final UserRepository userRepository;
    private final RoadmapRepository roadmapRepository;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(JsonParser.Feature.ALLOW_COMMENTS, true)
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    /**
     * 1. 로드맵 분석 및 저장
     */
    @Transactional
    public Map<String, Object> analyze(RoadmapRequestDto request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + email));

        String systemRole = "너는 IT/엔지니어링 전문 상위 1% 커리어 컨설턴트야. 사용자의 정보를 분석해 매우 구체적이고 실무적인 로드맵과 피드백을 JSON으로 제공해.";

        // 🔥 [프롬프트 수정] 시작점을 건너뛰지 못하도록 강력하게 강제!
        String userPrompt = String.format(
                "너는 IT 대기업 채용 팀장 출신의 1급 커리어 빌더야. 사용자의 현재 위치와 목표 기업 사이의 Gap을 분석하고, 합격할 수밖에 없는 '완주형 로드맵'을 설계해.\n\n" +

                        "**[사용자 프로필]**\n" +
                        "- 전공: %s / 현재: %s %s / 목표 직무: %s (%s)\n" +
                        "- 기술 스택: %s / 수강 과목: %s\n" +
                        "- 현재 스펙: 학점(%s), 어학(%s), 자격증(%s), 프로젝트(%s)\n\n" +

                        "**[로드맵 생성 규칙 - 절대 누락 금지]**\n" +
                        "1. **시작점 강제 고정**: 로드맵 배열의 첫 번째 항목은 무조건 입력받은 현재 시점인 '%s %s'가 되어야 해! 현재 학기를 건너뛰지 말고 첫 번째로 넣은 후, 여기서부터 졸업(4학년 겨울방학)까지 '단 하나의 시기도 빠뜨리지 말고' 모두 순서대로 작성해.\n" +
                        "2. **학년 명시 필수 (중요)**: '여름방학', '겨울방학'이라고 단독으로 쓰지 말고, 반드시 **'1학년 여름방학', '2학년 겨울방학'**처럼 앞에 해당 학년을 명시해! (예: [2학년 1학기, 2학년 여름방학, 2학년 2학기...])\n" +
                        "3. **3학기 표기 금지**: 한국 대학 체계에 맞춰 'n학년 n학기' 또는 'n학년 여름/겨울방학'으로만 표기해.\n" +
                        "4. **구체적 리소스**: '공부하세요' 대신 '인프런 OOO 강의 완강', '백준 Gold 티어 달성', '%s 기업 기술 블로그 분석' 등 수치와 고유명사를 사용해.\n\n" +

                        "**[JSON 응답 규격]**:\n" +
                        "{\n" +
                        "  \"semesterPlans\": [\n" +
                        "    { \"grade\": \"예: 2학년 여름방학 (반드시 학년 포함)\", \"goal\": [\"해당 시기의 핵심 목표 2개\"], \"courses\": [\"추천 전공 과목\"], \"activities\": [\"구체적인 실행 활동 3개\"] }\n" +
                        "  ],\n" +
                        "  \"analysis\": {\n" +
                        "    \"overallReview\": \"현재 위치에 대한 냉철하고 날카로운 분석 (300자 내외)\",\n" +
                        "    \"strengths\": [\"현재 데이터에서 찾아낸 강점 2개\"],\n" +
                        "    \"gaps\": {\n" +
                        "       \"owned\": [\"현재 보유한 핵심 역량\"],\n" +
                        "       \"missing\": [{ \"name\": \"부족한 기술 역량\", \"method\": \"구체적인 보완 방법(도서/강의명 포함)\" }],\n" +
                        "       \"aiFeedback\": \"목표 기업 합격을 위한 전략적 총평 (500자 이상)\"\n" +
                        "    },\n" +
                        "    \"topMissions\": [\"당장 다음 달까지 끝내야 할 필살 미션 3개\"],\n" +
                        "    \"recommendedResources\": [{ \"type\": \"도서/강의 등\", \"title\": \"제목\", \"reason\": \"이유\" }]\n" +
                        "  }\n" +
                        "}",
                request.getMajor(), request.getGrade(), request.getSemester(), request.getTargetJob(),
                request.getTargetCompany(),
                request.getTechStacks(), request.getCourses(),
                request.getGpa(), request.getLanguage(), request.getCurrentSpecs(), request.getProjects(),
                request.getGrade(), request.getSemester(), request.getTargetCompany());
        
        Map<String, Object> gptResult = getGptResponse(systemRole, userPrompt);
        if (gptResult == null) gptResult = new HashMap<>();

        try {
            if (gptResult.containsKey("semesterPlans")) {
                request.setRoadmapJson(objectMapper.writeValueAsString(gptResult.get("semesterPlans")));
            }
            if (gptResult.containsKey("analysis")) {
                request.setAnalysisResult(objectMapper.writeValueAsString(gptResult.get("analysis")));
            }
        } catch (Exception e) {
            log.error("JSON 변환 실패", e);
        }

        saveOrUpdateRoadmap(user, request);

        List<Map<String, String>> newsList = getMajorNews(request.getTargetJob());
        gptResult.put("newsList", newsList);

        return gptResult;
    }

    /**
     * 2. 내 로드맵 정보 조회
     */
    @Transactional(readOnly = true)
    public RoadmapRequestDto getMyRoadmap(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return roadmapRepository.findByUser(user)
                .map(roadmap -> RoadmapRequestDto.builder()
                        .name(user.getName())
                        .major(roadmap.getMajor())
                        .grade(roadmap.getGrade())
                        .semester(roadmap.getSemester())
                        .targetJob(roadmap.getTargetJob())
                        .targetCompany(roadmap.getTargetCompany())
                        .techStacks(roadmap.getTechStacks())
                        .currentSpecs(roadmap.getCurrentSpecs())
                        .courses(roadmap.getCourses())
                        .projects(roadmap.getProjects())
                        .gpa(roadmap.getGpa())
                        .language(roadmap.getLanguage())
                        .roadmapJson(roadmap.getRoadmapJson()) 
                        .analysisResult(roadmap.getAnalysisResult()) 
                        .build())
                .orElse(null);
    }

    /**
     * 3. 로드맵 진행도(체크박스) 업데이트
     */
    @Transactional
    public void updateRoadmapProgress(String email, String roadmapJson) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Roadmap roadmap = roadmapRepository.findByUser(user).orElseThrow();
        roadmap.setRoadmapJson(roadmapJson);
        roadmapRepository.save(roadmap);
    }

    private void saveOrUpdateRoadmap(User user, RoadmapRequestDto dto) {
        Roadmap roadmap = roadmapRepository.findByUser(user)
                .orElse(Roadmap.builder().user(user).build());

        roadmap.setMajor(dto.getMajor());
        roadmap.setGrade(dto.getGrade());
        roadmap.setSemester(dto.getSemester());
        roadmap.setTargetJob(dto.getTargetJob());
        roadmap.setTargetCompany(dto.getTargetCompany());
        roadmap.setTechStacks(dto.getTechStacks());
        roadmap.setCurrentSpecs(dto.getCurrentSpecs());
        roadmap.setCourses(dto.getCourses());
        roadmap.setProjects(dto.getProjects());
        roadmap.setGpa(dto.getGpa());
        roadmap.setLanguage(dto.getLanguage());
        
        if (dto.getRoadmapJson() != null) roadmap.setRoadmapJson(dto.getRoadmapJson());
        if (dto.getAnalysisResult() != null) roadmap.setAnalysisResult(dto.getAnalysisResult());

        roadmapRepository.save(roadmap);
    }

    private Map<String, Object> getGptResponse(String systemRole, String userPrompt) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-4o");
            body.put("messages", Arrays.asList(
                    Map.of("role", "system", "content", systemRole),
                    Map.of("role", "user", "content", userPrompt)));
            body.put("temperature", 0.2);
            body.put("response_format", Map.of("type", "json_object")); // 필수: JSON 형식 강제

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions", entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            String content = root.path("choices").get(0).path("message").path("content").asText();
            return objectMapper.readValue(content, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("GPT 호출 실패", e);
            return null;
        }
    }

    public List<Map<String, String>> getMajorNews(String keyword) {
        List<Map<String, String>> newsList = new ArrayList<>();
        try {
            String query = URLEncoder.encode(keyword + " 채용", StandardCharsets.UTF_8);
            String url = "https://news.google.com/rss/search?q=" + query + "&hl=ko&gl=KR&ceid=KR:ko";
            Document doc = Jsoup.connect(url).userAgent("Mozilla/5.0").timeout(5000).get();
            Elements items = doc.select("item");
            for (int i = 0; i < Math.min(items.size(), 4); i++) {
                Element item = items.get(i);
                Map<String, String> news = new HashMap<>();
                String title = item.select("title").text();
                if(title.contains(" - ")) title = title.substring(0, title.lastIndexOf(" - "));
                news.put("title", title);
                news.put("link", item.select("link").text());
                newsList.add(news);
            }
        } catch (Exception e) { log.error("뉴스 크롤링 실패", e); }
        return newsList;
    }

    /**
     * 4. 피드백 갱신 (학기 결산 시 호출)
     */
    @Transactional
    public void refreshFeedback(String email, String roadmapJson, String finishedGrade) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Roadmap roadmap = roadmapRepository.findByUser(user).orElseThrow();

        String systemRole = "너는 IT/엔지니어링 전문 상위 1% 커리어 컨설턴트야. 사용자의 진행 정보를 분석해 매우 구체적이고 실무적인 피드백을 JSON으로 제공해.";
        
        String userPrompt = String.format(
            "사용자의 목표 직무는 '%s'야. 방금 '%s' 학기를 결산했어.\n" +
            "현재까지의 로드맵 진행 데이터(JSON)는 다음과 같아:\n%s\n\n" +
            "내가 완료(isCompleted: true)한 항목과 미완료(isCompleted: false)한 항목을 분석해서, " +
            "**다음 학기를 위해 당장 시작해야 할 새로운 핵심 미션 3가지와 리소스**를 추천해줘.\n\n" +
            "**[중요: 아래 JSON 형식을 글자 하나 틀리지 말고 출력할 것]**:\n" +
            "{\n" +
            "  \"analysis\": {\n" +
            "    \"overallReview\": \"결산 결과에 따른 냉철한 총평 (200자 내외)\",\n" +
            "    \"strengths\": [\"결산 데이터에서 새로 발견된 강점 2개\"],\n" +
            "    \"gaps\": {\n" +
            "       \"owned\": [\"현재 보유 역량\"],\n" +
            "       \"missing\": [{ \"name\": \"부족 역량\", \"method\": \"해결책\" }],\n" +
            "       \"aiFeedback\": \"다음 학기를 위한 조언 (300자 내외)\"\n" +
            "    },\n" +
            "    \"topMissions\": [\"다음 학기 최우선 핵심 미션 1\", \"미션 2\", \"미션 3\"],\n" +
            "    \"recommendedResources\": [\n" +
            "       { \"type\": \"인터넷 강의\", \"title\": \"구체적인 강의명(예: 인프런 OOO)\", \"reason\": \"추천 이유\" }\n" +
            "    ]\n" +
            "  }\n" +
            "}",
            roadmap.getTargetJob(), finishedGrade, roadmapJson
        );

        Map<String, Object> gptResult = getGptResponse(systemRole, userPrompt);
        
        if (gptResult != null && gptResult.containsKey("analysis")) {
            try {
                roadmap.setRoadmapJson(roadmapJson); 
                roadmap.setAnalysisResult(objectMapper.writeValueAsString(gptResult.get("analysis")));
                roadmapRepository.save(roadmap);
                log.info("✅ 새로운 AI 피드백 갱신 완료!");
            } catch (Exception e) { 
                log.error("❌ 피드백 갱신(DB 저장) 실패: {}", e.getMessage()); 
            }
        } else {
            log.warn("⚠️ GPT 응답에 'analysis' 데이터가 없습니다.");
        }
    }
}