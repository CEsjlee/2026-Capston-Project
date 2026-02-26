package org.tukorea.com.grad.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NoteRequestDto {
    private String title;
    private String content;
    private String category;
    private Long userId;
}