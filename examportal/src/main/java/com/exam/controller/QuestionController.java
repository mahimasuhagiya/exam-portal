package com.exam.controller;

import com.exam.model.Question;
import com.exam.service.QuestionService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    private final QuestionService questionService;

    @Autowired
    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    // Get all questions
    @GetMapping
    public List<Question> getAllQuestions() {
        return questionService.getAllQuestions();
    }

    // Get a question by ID
    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        Optional<Question> question = questionService.getQuestionById(id);
        return question.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new question
    @PostMapping
    public ResponseEntity<?> createQuestion(
    		@RequestPart("question") String questionJson, // JSON data
            @RequestPart(value = "imagee", required = false) MultipartFile questionImage,
            @RequestPart(value = "optionAImage", required = false) MultipartFile optionAImage,
            @RequestPart(value = "optionBImage", required = false) MultipartFile optionBImage,
            @RequestPart(value = "optionCImage", required = false) MultipartFile optionCImage,
            @RequestPart(value = "optionDImage", required = false) MultipartFile optionDImage) {

        try {
        	//map json data to question model
        	Question question = new ObjectMapper().readValue(questionJson, Question.class);

        	 Question savedQuestion = questionService.saveQuestion(
                    question, questionImage, optionAImage, optionBImage, optionCImage, optionDImage);
            return ResponseEntity.ok(savedQuestion);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving question: " + e.getMessage());
        }
    }
    
    @GetMapping("/{id}/{name}")
    public ResponseEntity<Resource> getImage(@PathVariable Long id, @PathVariable String name) {
    	 Resource resource =questionService.getImage(id,name);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
     
    }

//    // Update an existing question
//    @PutMapping("/{id}")
//    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question questionDetails) {
//        Question updatedQuestion = questionService.updateQuestion(id, questionDetails);
//        return updatedQuestion != null ? ResponseEntity.ok(updatedQuestion) : ResponseEntity.notFound().build();
//    }

    // Delete a question
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
