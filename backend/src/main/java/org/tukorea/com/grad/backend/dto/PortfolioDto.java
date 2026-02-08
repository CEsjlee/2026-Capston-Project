package org.tukorea.com.grad.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PortfolioDto {
    private String introduction;
    private String techStack;
    private String projects;
    private String contact;

    @Getter
    @NoArgsConstructor
    public static class AiRequest {
        private String section; // "intro", "projects" 등 요청할 항목
    }
}