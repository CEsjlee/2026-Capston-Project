

package org.tukorea.com.grad.backend.util;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.tukorea.com.grad.backend.dto.TukoreaNoticeDto; // 나중에 만들 DTO

import java.util.ArrayList;
import java.util.List;

public class TukoreaParser {

    private static String categorize(String title) {
        title = title.toLowerCase();
        if (title.contains("취업") || title.contains("채용") || title.contains("인턴")) return "취업/채용";
        if (title.contains("특강") || title.contains("세미나")) return "특강/세미나";
        if (title.contains("모집") || title.contains("선발")) return "모집/신청";
        if (title.contains("교육") || title.contains("프로그램")) return "교육/프로그램";
        if (title.contains("공모전") || title.contains("대회")) return "공모전/대회";
        return "기타";
    }

    public static List<TukoreaNoticeDto> parseTable(String url) throws Exception {
        Document doc = Jsoup.connect(url).userAgent("Mozilla/5.0").get();
        List<TukoreaNoticeDto> list = new ArrayList<>();
        Elements rows = doc.select("table tbody tr");

        for (Element row : rows) {
            Element linkElem = row.selectFirst("td a");
            if (linkElem == null) continue;

            String title = linkElem.text();
            String link = linkElem.absUrl("href");
            String date = row.select("td").last().text();
            String category = categorize(title);

            list.add(new TukoreaNoticeDto(title, date, link, category));
        }
        return list;
    }
}