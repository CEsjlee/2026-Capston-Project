package org.tukorea.com.grad.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.tukorea.com.grad.backend.dto.NewsDto;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    public List<NewsDto> searchNews(String keyword) {
        List<NewsDto> newsList = new ArrayList<>();
        try {
            // 1. 키워드 인코딩 (한글 깨짐 방지)
            String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8);
            
            // 2. 구글 뉴스 RSS URL (화면 크롤링보다 훨씬 안정적임)
            String rssUrl = "https://news.google.com/rss/search?q=" + encodedKeyword + "&hl=ko&gl=KR&ceid=KR:ko";
            
            log.info("뉴스 검색 요청 URL: {}", rssUrl);

            // 3. Jsoup으로 XML 데이터 파싱
            Document doc = Jsoup.connect(rssUrl)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .timeout(5000)
                    .get();

            // 4. <item> 태그들 추출 (각각의 기사)
            Elements items = doc.select("item");

            for (Element item : items) {
                if (newsList.size() >= 6) break; // 최대 6개만 가져오기

                String title = item.select("title").text();
                String link = item.select("link").text();
                String pubDate = item.select("pubDate").text();
                
                // description 태그 안에 HTML이 섞여 있어서 태그 제거하고 순수 텍스트만 추출
                String descriptionHtml = item.select("description").text();
                String summary = Jsoup.parse(descriptionHtml).text(); 

                // 날짜 포맷팅 (너무 길어서 앞부분만 자름)
                if (pubDate.length() > 16) {
                    pubDate = pubDate.substring(0, 16); 
                }

                newsList.add(NewsDto.builder()
                        .title(title)
                        .link(link)
                        .summary(summary)
                        .publishedAt(pubDate)
                        .build());
            }

            log.info("뉴스 크롤링 성공: {}개 발견", newsList.size());

        } catch (Exception e) {
            log.error("뉴스 가져오기 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
        return newsList;
    }
}