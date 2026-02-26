package org.tukorea.com.grad.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.tukorea.com.grad.backend.dto.NewsDto;
import org.tukorea.com.grad.backend.service.NewsService;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NewsController {

    private final NewsService newsService;

    @GetMapping("/search")
    public ResponseEntity<List<NewsDto>> searchNews(@RequestParam String keyword) {
        System.out.println("뉴스 검색 요청: " + keyword);
        return ResponseEntity.ok(newsService.searchNews(keyword));
    }
}