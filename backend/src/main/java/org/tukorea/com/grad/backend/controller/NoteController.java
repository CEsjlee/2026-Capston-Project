package org.tukorea.com.grad.backend.controller;

import org.tukorea.com.grad.backend.dto.NoteDto;
import org.tukorea.com.grad.backend.entity.StudyNote;
import org.tukorea.com.grad.backend.entity.User;
import org.tukorea.com.grad.backend.repository.StudyNoteRepository;
import org.tukorea.com.grad.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final StudyNoteRepository studyNoteRepository;
    private final UserRepository userRepository;

    // 1. 노트 목록 조회 (GET /api/notes?subject=자료구조)
    @GetMapping
    public ResponseEntity<?> getMyNotes(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String subject // 과목 필터 (없으면 전체)
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        List<StudyNote> notes;
        if (subject == null || subject.isEmpty()) {
            notes = studyNoteRepository.findAllByUser(user); // 전체 조회
        } else {
            notes = studyNoteRepository.findAllByUserAndSubject(user, subject); // 과목별 조회
        }

        return ResponseEntity.ok(notes);
    }

    // 2. 노트 작성 (POST /api/notes)
    @PostMapping
    public ResponseEntity<?> createNote(
            @RequestBody NoteDto request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        StudyNote note = StudyNote.builder()
                .user(user)
                .subject(request.getSubject())
                .title(request.getTitle())
                .content(request.getContent())
                .tags(request.getTags())
                .build();

        studyNoteRepository.save(note);
        return ResponseEntity.ok(Map.of("message", "노트 작성 성공"));
    }

    // 3. 노트 삭제 (DELETE /api/notes/{noteId})
    @DeleteMapping("/{noteId}")
    public ResponseEntity<?> deleteNote(
            @PathVariable Long noteId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        StudyNote note = studyNoteRepository.findById(noteId)
                .orElseThrow(() -> new IllegalArgumentException("노트를 찾을 수 없습니다."));

        // [보안] 내 노트가 맞는지 확인 (남의 거 삭제하면 안 되니까)
        if (!note.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("삭제 권한이 없습니다.");
        }

        studyNoteRepository.delete(note);
        return ResponseEntity.ok(Map.of("message", "노트 삭제 성공"));
    }
}