package org.tukorea.com.grad.backend.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NoteResponseDto {
    private Long noteId;
    private String title;
    private String content;
    private String category;
    private String createdDate;
}