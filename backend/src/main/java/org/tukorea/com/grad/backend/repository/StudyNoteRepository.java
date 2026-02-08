package org.tukorea.com.grad.backend.repository;

import org.tukorea.com.grad.backend.entity.StudyNote;
import org.tukorea.com.grad.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudyNoteRepository extends JpaRepository<StudyNote, Long> {
    // 1. 내 노트 전체 조회
    List<StudyNote> findAllByUser(User user);
    
    // 2. 특정 과목의 내 노트만 조회 (필터링 기능)
    List<StudyNote> findAllByUserAndSubject(User user, String subject);
}