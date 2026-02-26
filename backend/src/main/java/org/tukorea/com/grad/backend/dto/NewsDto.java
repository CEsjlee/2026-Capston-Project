package org.tukorea.com.grad.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsDto {
    private String title;       // 기사 제목
    private String link;        // 기사 링크
    private String summary;     // 요약 내용
    private String publishedAt; // 발행일
}
