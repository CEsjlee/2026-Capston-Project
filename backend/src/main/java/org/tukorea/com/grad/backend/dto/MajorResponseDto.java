package org.tukorea.com.grad.backend.dto;

import lombok.Builder;
import lombok.Getter;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class MajorResponseDto {
    private String aiAdvice;              // 1. AI의 총평 (한줄 요약)
    private String nextSemesterPlan;      // 2. 다음 학기 추천 로드맵 (HTML 표)
    private String vacationPlan;          // 3. 다가오는 방학 추천 활동 (HTML 표)
    private String missingSkills;         // 4. 부족한 역량 및 추천 자격증 (HTML 표)
    private List<Map<String, String>> newsList; // 5. 관련 뉴스 (유지)
}