package org.tukorea.com.grad.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tukorea.com.grad.backend.entity.ActivityRecommendation;
import org.tukorea.com.grad.backend.entity.User;
import java.util.List;

public interface ActivityRepository extends JpaRepository<ActivityRecommendation, Long> {
    
    // 이 줄을 추가하세요! (사용자별로 찾아서 최신순으로 정렬)
    List<ActivityRecommendation> findByUserOrderByCreatedAtDesc(User user);
    
    // 기존에 있던 삭제 메소드
    void deleteByUser(User user);
}