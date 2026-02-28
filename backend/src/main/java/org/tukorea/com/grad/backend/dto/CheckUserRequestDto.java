package org.tukorea.com.grad.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckUserRequestDto {
    private String name;
    private String email;
}