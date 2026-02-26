package org.tukorea.com.grad.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // 1. 자기소개
    @Column(columnDefinition = "LONGTEXT")
    private String intro;

    // 2. 기술 스택
    @Column(columnDefinition = "LONGTEXT")
    private String stack;

    // 3. 프로젝트 경험
    @Column(columnDefinition = "LONGTEXT")
    private String projects;

    // 4. 활동 및 수상
    @Column(columnDefinition = "LONGTEXT")
    private String activities;
}