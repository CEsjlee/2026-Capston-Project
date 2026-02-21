package org.tukorea.com.grad.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TukoreaNoticeDto {
    private String title;
    private String date;
    private String link;
    private String category;
}