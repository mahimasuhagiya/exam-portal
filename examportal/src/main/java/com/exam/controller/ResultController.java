package com.exam.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.exam.model.Result;
import com.exam.service.ResultService;

@RestController
@RequestMapping("/result")
@CrossOrigin(origins = "http://localhost:3000")
public class ResultController {

    @Autowired
    private ResultService resultService;

    @GetMapping("/{flag}")
    public List<Result> getResultExamType(@PathVariable Boolean flag) {
        return resultService.getResultExamType(flag);
    }
    @GetMapping("/pending")
    public Long countPendingResults() {
        return resultService.countPendingResults();
    }
    
    @PutMapping("/{resultId}/{adminId}/{total}")
    public Result changeTotalOfResult(@PathVariable Long resultId, @PathVariable Long adminId,@PathVariable int total) {
    	return resultService.changeTotalOfResult(resultId, adminId, total);
    }
    
    @GetMapping
    public List<Result> getAllResult() {
        return resultService.getAllResult();
    }
    @GetMapping("/{examId}/{userId}")
    public Result getResultByExamAndUser(@PathVariable Long examId, @PathVariable Long userId) {
        return resultService.getResultByExamAndUser(examId,userId).get();
    }

   }