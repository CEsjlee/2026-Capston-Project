package org.tukorea.com.grad.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 유저의 프로필인지 연결 (1:1 관계)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String grade;       // 학년 (예: "3학년")
    private String major;       // 전공 (예: "컴퓨터공학과")
    private String interest;    // 관심 직무 (예: "백엔드 개발자")
    
    // 리스트 형태는 일단 문자열로 길게 저장 (콤마로 구분: "자료구조,알고리즘")
    private String courses;     // 수강 과목
    
    @Column(columnDefinition = "TEXT") 
    private String projects;    // 프로젝트 경험 (내용이 길 수 있어서 TEXT 타입)
    
    private Double gpa;         // 학점 (예: 4.0)
    private String certificates; // 자격증
    private String languageScore; // 어학 성적

    // 정보 수정(업데이트) 기능
    public void updateProfile(String grade, String major, String interest, 
                              String courses, String projects, Double gpa, 
                              String certificates, String languageScore) {
        this.grade = grade;
        this.major = major;
        this.interest = interest;
        this.courses = courses;
        this.projects = projects;
        this.gpa = gpa;
        this.certificates = certificates;
        this.languageScore = languageScore;
    }
}