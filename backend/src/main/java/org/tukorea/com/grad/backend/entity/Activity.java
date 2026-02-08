
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
@Table(name = "activities")
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;        // 공모전, 채용, 대외활동 등
    private String title;       // 제목
    private String organizer;   // 주최
    private String deadline;    // 마감일 (편의상 String으로 함. "2026-02-28")
    private String teamInfo;    // 팀 구성 정보 ("3~5인 팀")

    @ElementCollection
    @CollectionTable(name = "activity_tags", joinColumns = @JoinColumn(name = "activity_id"))
    @Column(name = "tag")
    private List<String> tags;  // 태그 리스트 ["#창업", "#IT"]
}