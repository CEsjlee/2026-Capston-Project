package org.tukorea.com.grad.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.tukorea.com.grad.backend.dto.NewsDto;
import org.tukorea.com.grad.backend.dto.TukoreaNoticeDto;
import org.tukorea.com.grad.backend.entity.News;
import org.tukorea.com.grad.backend.entity.SchoolNotice;
import org.tukorea.com.grad.backend.repository.NewsRepository;
import org.tukorea.com.grad.backend.repository.SchoolNoticeRepository;
import org.tukorea.com.grad.backend.util.RssParser;
import org.tukorea.com.grad.backend.util.TukoreaParser;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CrawlingService {

    private final SchoolNoticeRepository schoolNoticeRepository;
    private final NewsRepository newsRepository;

    // 1. 학교 공지사항 크롤링 (매일 새벽 4시)
    // @Scheduled(cron = "0 0 4 * * *")
    @Scheduled(initialDelay = 3000, fixedDelay = 10000000) // 테스트용: 3초 뒤 실행
    @Transactional
    public void crawlSchoolNotices() {
        System.out.println("🏫 학교 공지사항 크롤링 시작...");
        
        // 비교과 공지사항 URL
        String url = "https://www.tukorea.ac.kr/tukorea/6622/subview.do";

        try {
            // (1) 파서 호출해서 데이터 가져오기
            List<TukoreaNoticeDto> notices = TukoreaParser.parseTable(url);
            
            int count = 0;
            for (TukoreaNoticeDto dto : notices) {
                // (2) 중복 검사: DB에 없는 링크일 때만 저장
                if (!schoolNoticeRepository.existsByLink(dto.getLink())) {
                    
                    SchoolNotice entity = SchoolNotice.builder()
                            .title(dto.getTitle())
                            .date(dto.getDate())
                            .link(dto.getLink())
                            .category(dto.getCategory())
                            .build();

                    schoolNoticeRepository.save(entity); // 저장!
                    count++;
                }
            }
            System.out.println("✅ 학교 공지사항 크롤링 완료! " + count + "개의 새 글 저장됨.");

        } catch (Exception e) {
            System.err.println("❌ 학교 공지사항 크롤링 중 오류: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // 2. IT 뉴스 크롤링 (매일 새벽 5시)
    // @Scheduled(cron = "0 0 5 * * *") 
    @Scheduled(initialDelay = 10000, fixedDelay = 10000000) // 테스트용: 10초 뒤 실행
    @Transactional
    public void crawlNews() {
        System.out.println("📰 IT 뉴스 크롤링 시작...");
        
        // 구글 뉴스 RSS 주소 (IT/과학 분야)
        String rssUrl = "https://news.google.com/rss/search?q=IT+개발+채용&hl=ko&gl=KR&ceid=KR:ko";

        try {
            List<NewsDto> newsList = RssParser.parse(rssUrl);
            int count = 0;

            for (NewsDto dto : newsList) {
                // 중복 검사
                if (!newsRepository.existsByLink(dto.getLink())) {
                    News entity = News.builder()
                            .title(dto.getTitle())
                            .link(dto.getLink())
                            .publishedAt(dto.getPublishedAt())
                            .summary(dto.getSummary())
                            .build();
                    
                    newsRepository.save(entity);
                    count++;
                }
            }
            System.out.println("✅ 뉴스 크롤링 완료! " + count + "개의 새 뉴스 저장됨.");
            
        } catch (Exception e) {
            System.err.println("❌ 뉴스 크롤링 중 오류: " + e.getMessage());
        }
    }
}