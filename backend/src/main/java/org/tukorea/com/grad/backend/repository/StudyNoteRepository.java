package org.tukorea.com.grad.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.tukorea.com.grad.backend.entity.StudyNote;
import java.util.List;

public interface StudyNoteRepository extends JpaRepository<StudyNote, Long> {
    List<StudyNote> findAllByUser_IdOrderByCreatedAtDesc(Long userId);
    List<StudyNote> findAllByUser_IdAndCategoryOrderByCreatedAtDesc(Long userId, String category);
}