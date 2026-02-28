package org.tukorea.com.grad.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 고유 번호

    @Column(nullable = false, unique = true)
    private String email; // ★ 아이디 역할 (이메일 로그인)

    @Column(nullable = false)
    private String password; // 비밀번호

    @Column(nullable = false)
    private String name; // 이름

    @Enumerated(EnumType.STRING)
    private Role role; // 권한 (USER, ADMIN) - 아래에서 Enum 만들 예정

    // 🔥 [추가된 부분] 임시 비밀번호 발급 등 비밀번호 변경을 위한 안전한 메서드 추가
    public void setPassword(String password) {
        this.password = password;
    }
}