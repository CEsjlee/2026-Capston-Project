package org.tukorea.com.grad.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // ★ 필수 추가
import org.springframework.web.bind.annotation.*;
import org.tukorea.com.grad.backend.dto.NoteRequestDto;
import org.tukorea.com.grad.backend.dto.NoteResponseDto;
import org.tukorea.com.grad.backend.service.StudyNoteService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api") 
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class StudyNoteController {

    private final StudyNoteService noteService;

    // --- 노트 관련 API (/api/notes) ---

    // 1. 노트 생성 (Authentication 추가)
    @PostMapping("/notes")
    public ResponseEntity<String> createNote(
            Authentication authentication, // ★ JWT 토큰 정보 가져오기
            @RequestBody NoteRequestDto dto) {
        
        String email = authentication.getName(); // 토큰에서 이메일 꺼내기
        noteService.createNote(dto, email);      // 서비스로 이메일 전달
        
        return ResponseEntity.ok("노트 작성 성공");
    }

    // 2. 노트 조회 (userId 대신 Authentication 사용)
    @GetMapping("/notes")
    public ResponseEntity<List<NoteResponseDto>> getNotes(
            Authentication authentication, // ★ JWT 토큰 정보 가져오기
            @RequestParam(required = false) String category) {
        
        String email = authentication.getName(); // 토큰에서 이메일 꺼내기
        
        return ResponseEntity.ok(noteService.getNotes(email, category));
    }

    // 3. 노트 수정 (기존과 동일)
    @PutMapping("/notes/{noteId}")
    public ResponseEntity<String> updateNote(@PathVariable Long noteId, @RequestBody NoteRequestDto dto) {
        noteService.updateNote(noteId, dto); 
        return ResponseEntity.ok("노트 수정 성공");
    }

    // 4. 노트 삭제 (기존과 동일)
    @DeleteMapping("/notes/{noteId}")
    public ResponseEntity<String> deleteNote(@PathVariable Long noteId) {
        noteService.deleteNote(noteId);
        return ResponseEntity.ok("노트 삭제 성공");
    }

    // --- 🔥 AI 관련 API (/api/ai/ask) ---
    @PostMapping("/ai/ask")
    public ResponseEntity<Map<String, String>> askAi(@RequestBody Map<String, String> request) {
        String noteContent = request.get("noteContent");
        String question = request.get("question");

        String answer = noteService.askAi(noteContent, question);

        return ResponseEntity.ok(Map.of("answer", answer));
    }
}