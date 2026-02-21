package org.tukorea.com.grad.backend.util;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.tukorea.com.grad.backend.dto.NewsDto;

import java.util.ArrayList;
import java.util.List;

public class RssParser {

    public static List<NewsDto> parse(String rssUrl) throws Exception {
        List<NewsDto> newsList = new ArrayList<>();
        
        // RSS XML 문서를 Jsoup으로 가져옴
        Document doc = Jsoup.connect(rssUrl).ignoreContentType(true).get();
        Elements items = doc.select("item");

        for (Element item : items) {
            NewsDto news = new NewsDto();
            
            if (item.selectFirst("title") != null) news.setTitle(item.selectFirst("title").text());
            if (item.selectFirst("link") != null) news.setLink(item.selectFirst("link").text());
            if (item.selectFirst("pubDate") != null) news.setPublishedAt(item.selectFirst("pubDate").text());
            
            // 요약문(description)에서 HTML 태그 제거하고 순수 텍스트만 추출
            if (item.selectFirst("description") != null) {
                String rawHtml = item.selectFirst("description").text();
                String cleanText = Jsoup.parse(rawHtml).text();
                news.setSummary(cleanText);
            }
            newsList.add(news);
        }
        return newsList;
    }
}