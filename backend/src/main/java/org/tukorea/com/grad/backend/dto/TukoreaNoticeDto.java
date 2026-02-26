package org.tukorea.com.grad.backend.dto;


import lombok.Builder;
import lombok.Getter;


@Getter
@Builder
public class TukoreaNoticeDto {

    private String title;
    private String date;
    private String link;
    private String category;

    private String major;
    private String grade;
    private String generatedDate;

    private String content;
    private String imageUrl;
}