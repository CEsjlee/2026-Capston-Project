package org.tukorea.com.grad.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tukorea.com.grad.backend.entity.Portfolio;
import org.tukorea.com.grad.backend.entity.User;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    Optional<Portfolio> findByUser(User user);

    // 회원 탈퇴 시 삭제 메소드
    void deleteByUser(org.tukorea.com.grad.backend.entity.User user);
}
