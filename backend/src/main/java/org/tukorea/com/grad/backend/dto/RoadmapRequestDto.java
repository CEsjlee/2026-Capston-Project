package org.tukorea.com.grad.backend.dto;

import lombok.*;

@Getter 
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapRequestDto {
    private String name;           // 사용자 이름 (조회 시 활용)
    private String major;          // 전공
    private String grade;          // 학년
    private String semester;       // [통합 추가] 학기 (1학기/2학기 등)
    private String targetJob;      // 목표 직무
    private String targetCompany;  // 목표 기업
    private String techStacks;     // 기술 스택
    private String currentSpecs;   // 현재 스펙
    private String courses;        // 수강 과목
    private String projects;       // 프로젝트 경험
    private String gpa;            // 학점
    private String language;       // 어학 성적
    
    // ★ [통합 추가 1] 로드맵 구조 및 체크박스 상태 (JSON 데이터)
    // 이 필드가 있어야 사용자가 체크한 항목이 DB에 저장됩니다.
    private String roadmapJson;

    // ★ [통합 추가 2] AI 분석 결과 (JSON 데이터)
    // GPT가 분석한 총평, Gap 분석 등이 이 필드에 담겨 전달됩니다.
    private String analysisResult;
}