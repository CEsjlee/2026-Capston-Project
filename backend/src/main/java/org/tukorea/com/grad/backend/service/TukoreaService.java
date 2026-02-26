package org.tukorea.com.grad.backend.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.tukorea.com.grad.backend.dto.TukoreaNoticeDto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class TukoreaService {

    private static final String BASE_URL = "https://www.tukorea.ac.kr";
    private static final String BOARD_URL =
            "https://www.tukorea.ac.kr/tukorea/6622/subview.do";

    /**
     * 비교과 공지 목록 가져오기
     */
    public List<TukoreaNoticeDto> getExtracurriculars(String major, String grade) {

        List<TukoreaNoticeDto> noticeList = new ArrayList<>();

        try {
            Document doc = Jsoup.connect(BOARD_URL)
                    .userAgent("Mozilla/5.0")
                    .timeout(10000)
                    .get();

            Elements rows = doc.select("tbody tr");

            for (Element row : rows) {

                Element titleElement = row.selectFirst("a");
                if (titleElement == null) continue;

                String title = titleElement.text().trim();
                String href = titleElement.attr("href");

                if (href == null || href.isEmpty()) continue;

                String link = href.startsWith("http")
                        ? href
                        : BASE_URL + href;

                TukoreaNoticeDto detail =
                        parseDetailPage(title, link, major, grade);

                if (detail != null) {
                    noticeList.add(detail);
                }

                // 최대 6개만 가져오기
                if (noticeList.size() >= 6) break;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return noticeList;
    }

    /**
     * 상세 페이지 파싱
     */
    private TukoreaNoticeDto parseDetailPage(
            String title,
            String link,
            String major,
            String grade) {

        try {
            Document detailDoc = Jsoup.connect(link)
                    .userAgent("Mozilla/5.0")
                    .timeout(10000)
                    .get();

            // ===== 1️⃣ 등록일 =====
            Element dateElement =
                    detailDoc.selectFirst("dt:contains(등록일) + dd");

            String date = dateElement != null
                    ? dateElement.text().trim()
                    : "날짜 정보 없음";

            // ===== 2️⃣ 본문 내용 =====
            Element contentElement =
                    detailDoc.selectFirst(".view-con");

            String content = contentElement != null
                    ? contentElement.text().trim()
                    : "";

            // ===== 3️⃣ 이미지 =====
            Element imgElement =
                    detailDoc.selectFirst(".view-con img");

            String imageUrl = null;

            if (imgElement != null) {
                String src = imgElement.attr("src");

                imageUrl = src.startsWith("http")
                        ? src
                        : BASE_URL + src;
            }

            // ===== 4️⃣ DTO 생성 (Builder 방식) =====
            return TukoreaNoticeDto.builder()
                    .title(title)
                    .date(date)
                    .link(link)
                    .category("비교과")
                    .major(major)
                    .grade(grade)
                    .generatedDate(LocalDate.now().toString())
                    .content(content)
                    .imageUrl(imageUrl)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}