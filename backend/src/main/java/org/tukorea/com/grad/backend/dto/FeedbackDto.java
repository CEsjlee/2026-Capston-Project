package org.tukorea.com.grad.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
public class FeedbackDto {
    private List<String> achievements;
    private List<String> analysis;
    private List<String> recommendations;
}