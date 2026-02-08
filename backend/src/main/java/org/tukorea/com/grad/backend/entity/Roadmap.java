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
@Table(name = "roadmaps")
public class Roadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 누구의 로드맵인지 (User와 1:1 연결)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String targetJob;   // 목표 직무 (예: 백엔드 개발자)
    private String currentGrade; // 현재 학년

    // 목표 리스트 (예: ["자격증 따기", "학점 4.0"])
    @ElementCollection
    @CollectionTable(name = "roadmap_goals", joinColumns = @JoinColumn(name = "roadmap_id"))
    @Column(name = "goal")
    private List<String> goals;

    // 추천 강의 리스트
    @ElementCollection
    @CollectionTable(name = "roadmap_courses", joinColumns = @JoinColumn(name = "roadmap_id"))
    @Column(name = "course")
    private List<String> recommendedCourses;

    // 추천 활동 리스트
    @ElementCollection
    @CollectionTable(name = "roadmap_activities", joinColumns = @JoinColumn(name = "roadmap_id"))
    @Column(name = "activity")
    private List<String> recommendedActivities;

    @Column(columnDefinition = "TEXT")
    private String aiAdvice; // AI 조언 (긴 글)

    // 나중에 AI가 분석하면 내용을 갈아끼우는 메서드
    public void updateRoadmap(String targetJob, List<String> goals, List<String> courses, 
                              List<String> activities, String aiAdvice) {
        this.targetJob = targetJob;
        this.goals = goals;
        this.recommendedCourses = courses;
        this.recommendedActivities = activities;
        this.aiAdvice = aiAdvice;
    }
}