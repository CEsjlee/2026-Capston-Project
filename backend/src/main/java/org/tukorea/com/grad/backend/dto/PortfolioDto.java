package org.tukorea.com.grad.backend.dto;

import lombok.*;

@Getter @Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioDto {
    private String intro;
    private String stack;
    private String projects;
    private String activities;
}