package org.tukorea.com.grad.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "feedbacks")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 유저와 1:1 연결 (한 명당 하나의 피드백 분석 결과)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // 1. 달성 현황 (예: "자료구조 A+ 달성", "토익 900점 돌파")
    @ElementCollection
    @CollectionTable(name = "feedback_achievements", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "content")
    private List<String> achievements;

    // 2. 분석 내용 / 미달성 원인 (예: "프로젝트 경험이 부족합니다.")
    @ElementCollection
    @CollectionTable(name = "feedback_analysis", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "content")
    private List<String> analysis;

    // 3. 이번 학기 추천 활동 (예: "오픈소스 컨트리뷰톤 참여")
    @ElementCollection
    @CollectionTable(name = "feedback_recommendations", joinColumns = @JoinColumn(name = "feedback_id"))
    @Column(name = "content")
    private List<String> recommendations;

    // 내용 업데이트 메서드
    public void updateFeedback(List<String> achievements, List<String> analysis, List<String> recommendations) {
        this.achievements = achievements;
        this.analysis = analysis;
        this.recommendations = recommendations;
    }
}