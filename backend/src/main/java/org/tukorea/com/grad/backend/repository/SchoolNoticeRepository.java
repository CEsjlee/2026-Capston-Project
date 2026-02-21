package org.tukorea.com.grad.backend.repository;

import org.tukorea.com.grad.backend.entity.SchoolNotice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SchoolNoticeRepository extends JpaRepository<SchoolNotice, Long> {
    // 이미 저장된 링크인지 확인하는 기능
    boolean existsByLink(String link);
}