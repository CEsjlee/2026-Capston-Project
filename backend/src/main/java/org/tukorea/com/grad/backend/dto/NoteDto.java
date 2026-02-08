package org.tukorea.com.grad.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
public class NoteDto {
    private String subject;
    private String title;
    private String content;
    private List<String> tags;
}