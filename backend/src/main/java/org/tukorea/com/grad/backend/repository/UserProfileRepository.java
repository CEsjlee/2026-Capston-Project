package org.tukorea.com.grad.backend.repository;



import org.tukorea.com.grad.backend.entity.User;
import org.tukorea.com.grad.backend.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    // 유저 정보로 프로필 찾기
    Optional<UserProfile> findByUser(User user);
}
