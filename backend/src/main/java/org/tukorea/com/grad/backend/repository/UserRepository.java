package org.tukorea.com.grad.backend.repository;


import org.tukorea.com.grad.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // 이메일로 회원 찾기 (로그인, 중복검사 때 사용)
    Optional<User> findByEmail(String email);
}