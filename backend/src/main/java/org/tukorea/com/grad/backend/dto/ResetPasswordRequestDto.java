package org.tukorea.com.grad.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequestDto {
    private String name;
    private String email;
    private String newPassword;
}