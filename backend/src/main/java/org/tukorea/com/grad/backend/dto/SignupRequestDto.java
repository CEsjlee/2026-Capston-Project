package org.tukorea.com.grad.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SignupRequestDto {
    private String name;
    private String email;
    private String password;
}