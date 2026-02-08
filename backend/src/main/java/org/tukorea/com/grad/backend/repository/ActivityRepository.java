package org.tukorea.com.grad.backend.repository;

import org.tukorea.com.grad.backend.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    // 카테고리(공모전, 대외활동 등)로 필터링해서 찾기
    List<Activity> findByType(String type);
}
