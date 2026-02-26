package org.tukorea.com.grad.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tukorea.com.grad.backend.entity.Roadmap;
import org.tukorea.com.grad.backend.entity.User;
import java.util.Optional;

// JpaRepository를 상속받으면 저장(save), 삭제(delete) 기능을 공짜로 얻습니다.
public interface RoadmapRepository extends JpaRepository<Roadmap, Long> {
    
    // 특정 사용자의 로드맵 정보를 하나 찾아오는 함수입니다.
    // 이 함수 이름만 보고 스프링이 "SELECT * FROM roadmap WHERE user_id = ?" 쿼리를 자동으로 만듭니다.
    Optional<Roadmap> findByUser(User user);
}