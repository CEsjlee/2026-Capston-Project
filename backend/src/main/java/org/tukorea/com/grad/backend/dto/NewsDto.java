package org.tukorea.com.grad.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NewsDto {
    private String title;
    private String link;
    private String publishedAt;
    private String summary;
}