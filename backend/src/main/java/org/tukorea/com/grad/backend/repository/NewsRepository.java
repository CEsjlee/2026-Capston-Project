package org.tukorea.com.grad.backend.repository;

import org.tukorea.com.grad.backend.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsRepository extends JpaRepository<News, Long> {
    // 이미 저장된 뉴스인지 링크로 확인
    boolean existsByLink(String link);
}