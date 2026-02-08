package org.tukorea.com.grad.backend.repository;


import org.tukorea.com.grad.backend.entity.Roadmap;
import org.tukorea.com.grad.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
    // 유저로 로드맵 찾기
    Optional<Roadmap> findByUser(User user);
}