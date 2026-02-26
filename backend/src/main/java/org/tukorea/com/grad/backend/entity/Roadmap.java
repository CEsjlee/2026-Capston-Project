package org.tukorea.com.grad.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Roadmap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String major;
    private String grade;
    private String semester; // [B팀원 추가] 학기 정보
    private String targetJob;
    private String targetCompany;
    
    @Column(columnDefinition = "TEXT")
    private String techStacks;
    
    @Column(columnDefinition = "TEXT")
    private String currentSpecs;

    @Column(columnDefinition = "TEXT")
    private String courses; 
    
    @Column(columnDefinition = "TEXT")
    private String projects;

    private String gpa;
    private String language;

    // ★ [통합 추가 1] 로드맵 구조 및 체크 상태 저장 (JSON)
    // 프론트엔드에서 체크박스를 누를 때마다 이 컬럼이 업데이트됩니다.
    @Column(columnDefinition = "LONGTEXT")
    private String roadmapJson;

    // ★ [통합 추가 2] AI 분석 결과(JSON 문자열)를 통째로 저장할 필드
    // 피드백 탭에서 보여줄 총평, Gap 분석 등이 들어갑니다. (MySQL LONGTEXT 4GB까지 안전하게 저장)
    @Column(columnDefinition = "LONGTEXT")
    private String analysisResult;
}