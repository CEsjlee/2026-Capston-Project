package org.tukorea.com.grad.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.tukorea.com.grad.backend.dto.TukoreaNoticeDto;
import org.tukorea.com.grad.backend.service.TukoreaService;

import java.util.List;

@RestController
@RequestMapping("/api/tukorea")
public class TukoreaController {

    private final TukoreaService tukoreaService;

    public TukoreaController(TukoreaService tukoreaService) {
        this.tukoreaService = tukoreaService;
    }

    @GetMapping("/extracurriculars")
    public List<TukoreaNoticeDto> extracurriculars(
            @RequestParam String major,
            @RequestParam String grade) {

        return tukoreaService.getExtracurriculars(major, grade);
    }
}
