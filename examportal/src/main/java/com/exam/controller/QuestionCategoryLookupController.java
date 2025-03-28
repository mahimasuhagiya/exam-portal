package com.exam.controller;

import com.exam.model.QuestionCategoryLookup;
import com.exam.service.QuestionCategoryLookupService;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/question_categories")
@CrossOrigin(origins = "http://localhost:3000")
public class QuestionCategoryLookupController {

	@Autowired
	private QuestionCategoryLookupService questionCategoryService;

	@PostMapping()
	public ResponseEntity<?> createQuestionCategory(
			@RequestBody QuestionCategoryLookup questionCategory) {
		try {
			QuestionCategoryLookup savedQuestionCategory = questionCategoryService
					.saveQuestionCategory(questionCategory);
			return new ResponseEntity<>(savedQuestionCategory, HttpStatus.CREATED);
		}
		catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Error saving category: " + ex.getMessage()));
		}
	}

	@GetMapping
	public List<QuestionCategoryLookup> getAllQuestionCategories() {
		return questionCategoryService.getAllQuestionCategories();
	}

	@PutMapping
	public ResponseEntity<?> updateQuestionCategory(
			@RequestBody QuestionCategoryLookup questionCategory) {
		try {
			QuestionCategoryLookup updatedQuestionCategory = questionCategoryService
					.updateQuestionCategory(questionCategory);
			return ResponseEntity.ok(updatedQuestionCategory);
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Error saving category: " + ex.getMessage()));
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteQuestionCategory(@PathVariable Long id) {
		try {
			questionCategoryService.deleteQuestionCategory(id);
			return ResponseEntity.noContent().build();
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		}
	}
}