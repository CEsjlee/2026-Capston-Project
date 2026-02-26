package org.tukorea.com.grad.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.tukorea.com.grad.backend.dto.NoteRequestDto;
import org.tukorea.com.grad.backend.dto.NoteResponseDto;
import org.tukorea.com.grad.backend.entity.StudyNote;
import org.tukorea.com.grad.backend.entity.User;
import org.tukorea.com.grad.backend.repository.StudyNoteRepository;
import org.tukorea.com.grad.backend.repository.UserRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyNoteService {

    private final StudyNoteRepository noteRepository;
    private final UserRepository userRepository;

    // 🚨 환경변수에서 API 키 가져오기 (보안)
    @Value("${openai.api.key}")
    private String apiKey;

    // 1. 노트 생성 (수정: 토큰에서 추출한 email로 유저 찾기)
    @Transactional
    public Long createNote(NoteRequestDto dto, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다: " + email));

        StudyNote note = StudyNote.builder()
                .user(user)
                .title(dto.getTitle())
                .content(dto.getContent())
                .category(dto.getCategory())
                .build();

        return noteRepository.save(note).getNoteId();
    }

    // 2. 노트 조회 (수정: 토큰에서 추출한 email로 유저 찾기)
    @Transactional(readOnly = true)
    public List<NoteResponseDto> getNotes(String email, String category) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));
        
        Long userId = user.getId(); // 찾은 유저의 DB PK 가져오기

        List<StudyNote> notes;
        
        if (category == null || category.equals("ALL")) {
            notes = noteRepository.findAllByUser_IdOrderByCreatedAtDesc(userId);
        } else {
            notes = noteRepository.findAllByUser_IdAndCategoryOrderByCreatedAtDesc(userId, category);
        }

        return notes.stream().map(note -> NoteResponseDto.builder()
                .noteId(note.getNoteId())
                .title(note.getTitle())
                .content(note.getContent())
                .category(note.getCategory())
                .createdDate(note.getCreatedAt().toString())
                .build()).collect(Collectors.toList());
    }

    // 3. 노트 수정
    @Transactional
    public void updateNote(Long noteId, NoteRequestDto dto) {
        StudyNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new IllegalArgumentException("해당 노트를 찾을 수 없습니다. id=" + noteId));

        note.update(dto.getTitle(), dto.getContent(), dto.getCategory());
    }

    // 4. 노트 삭제
    @Transactional
    public void deleteNote(Long noteId) {
        StudyNote note = noteRepository.findById(noteId)
                .orElseThrow(() -> new IllegalArgumentException("해당 노트를 찾을 수 없습니다. id=" + noteId));
        
        noteRepository.delete(note);
    }

    // 5. OpenAI API 호출
    @SuppressWarnings({"unchecked", "rawtypes"})
    public String askAi(String content, String question) {
        String url = "https://api.openai.com/v1/chat/completions";

        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // 1. 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey); // @Value로 안전하게 주입받은 키 사용

            // 2. 요청 바디(프롬프트) 설정
            String prompt = "학생의 전공 학습 노트 내용입니다:\n" + content + 
                            "\n\n질문: " + question + 
                            "\n위의 노트 내용을 바탕으로 친절하고 자세하게 답변해줘.";

            Map<String, Object> body = new HashMap<>();
            body.put("model", "gpt-3.5-turbo"); 
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", "당신은 컴퓨터공학 전공 튜터입니다."));
            messages.add(Map.of("role", "user", "content", prompt));
            
            body.put("messages", messages);
            body.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            // 3. API 호출
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            // 4. 응답 파싱 (@SuppressWarnings 덕분에 노란줄 안 생김)
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }

            return "AI 응답을 받지 못했습니다.";

        } catch (Exception e) {
            e.printStackTrace();
            return "AI 서버 통신 오류: " + e.getMessage();
        }
    }
}