package org.tukorea.com.grad.backend.repository;

import org.tukorea.com.grad.backend.entity.Portfolio;
import org.tukorea.com.grad.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    Optional<Portfolio> findByUser(User user);
}