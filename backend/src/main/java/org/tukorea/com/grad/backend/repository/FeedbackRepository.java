package org.tukorea.com.grad.backend.repository;

import org.tukorea.com.grad.backend.entity.Feedback;
import org.tukorea.com.grad.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByUser(User user);
}