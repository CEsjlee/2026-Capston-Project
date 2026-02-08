package org.tukorea.com.grad.backend.dto;


import org.tukorea.com.grad.backend.entity.Roadmap;
import lombok.Getter;
import java.util.List;

@Getter
public class RoadmapResponseDto {
    private String targetJob;
    private String currentGrade;
    private RoadmapDetail roadmap; // 아래에 만든 내부 클래스 사용
    private String aiAdvice;

    // Entity -> DTO 변환 생성자
    public RoadmapResponseDto(Roadmap entity) {
        this.targetJob = entity.getTargetJob();
        this.currentGrade = entity.getCurrentGrade();
        this.aiAdvice = entity.getAiAdvice();
        this.roadmap = new RoadmapDetail(
            entity.getGoals(),
            entity.getRecommendedCourses(),
            entity.getRecommendedActivities()
        );
    }

    @Getter
    public static class RoadmapDetail {
        private List<String> goals;
        private List<String> recommendedCourses;
        private List<String> recommendedActivities;

        public RoadmapDetail(List<String> goals, List<String> courses, List<String> activities) {
            this.goals = goals;
            this.recommendedCourses = courses;
            this.recommendedActivities = activities;
        }
    }
}