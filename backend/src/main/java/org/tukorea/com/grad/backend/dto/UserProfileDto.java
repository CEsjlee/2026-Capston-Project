package org.tukorea.com.grad.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
public class UserProfileDto {
    private String grade;
    private String major;
    private String interest;
    private List<String> courses; // 프론트에서는 리스트로 보냄 ["자료구조", "OS"]
    private String projects;
    private Double gpa;
    private String certificates;
    private String languageScore;
}