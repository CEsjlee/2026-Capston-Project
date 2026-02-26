package org.tukorea.com.grad.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tukorea.com.grad.backend.entity.User; 
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}