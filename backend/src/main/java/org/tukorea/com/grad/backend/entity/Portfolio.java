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
@Table(name = "portfolios")
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "TEXT")
    private String introduction; // 자기소개

    @Column(columnDefinition = "TEXT")
    private String techStack;    // 기술 스택

    @Column(columnDefinition = "TEXT")
    private String projects;     // 프로젝트 경험

    @Column(columnDefinition = "TEXT")
    private String contact;      // 연락처

    public void updatePortfolio(String introduction, String techStack, String projects, String contact) {
        this.introduction = introduction;
        this.techStack = techStack;
        this.projects = projects;
        this.contact = contact;
    }
}