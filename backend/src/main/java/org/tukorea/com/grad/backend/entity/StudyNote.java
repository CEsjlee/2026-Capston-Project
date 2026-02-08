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
@Table(name = "study_notes")
public class StudyNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ★ 중요: 한 명의 유저가 '여러 개'의 노트를 씀 (Many-To-One)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String subject; // 과목 (예: 자료구조)
    private String title;   // 제목
    
    @Column(columnDefinition = "TEXT")
    private String content; // 내용

    // 태그 리스트 ["#중간고사", "#공부"]
    @ElementCollection
    @CollectionTable(name = "note_tags", joinColumns = @JoinColumn(name = "note_id"))
    @Column(name = "tag")
    private List<String> tags;
}