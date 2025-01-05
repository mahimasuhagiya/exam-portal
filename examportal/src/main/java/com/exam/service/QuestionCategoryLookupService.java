package com.exam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.exam.model.QuestionCategoryLookup;
import com.exam.repository.QuestionCategoryLookupRepository;
import com.exam.service.QuestionCategoryLookupService;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionCategoryLookupService {

	@Autowired
	private QuestionCategoryLookupRepository questionCategoryLookupRepository;

	public QuestionCategoryLookup saveQuestionCategory(QuestionCategoryLookup questionCategory) {
		if (isCategoryExist(questionCategory.getName())) {
			throw new IllegalArgumentException("Category already exists.");
		}
		return questionCategoryLookupRepository.save(questionCategory);
	}

	public List<QuestionCategoryLookup> getAllQuestionCategories() {
		return questionCategoryLookupRepository.findAll();
	}

	public QuestionCategoryLookup updateQuestionCategory(QuestionCategoryLookup questionCategory) {
		if (isCategoryExist(questionCategory.getName()) && !isSameCategory(questionCategory.getId(), questionCategory.getName())) {
			throw new RuntimeException("Category already exists.");
		}
		return questionCategoryLookupRepository.save(questionCategory);
	}

	public void deleteQuestionCategory(Long id) {
		questionCategoryLookupRepository.deleteById(id);
	}

	// Helper method to check if the category exists
	private boolean isCategoryExist(String category) {
		Optional<QuestionCategoryLookup> existingCategory= questionCategoryLookupRepository.findByName(category);
		return existingCategory.isPresent();
	}

	// Helper method to check if the category name is the same as current
	// (for update case)
	private boolean isSameCategory(Long id, String category) {
		Optional<QuestionCategoryLookup> Category = questionCategoryLookupRepository.findById(id);
		return Category.isPresent() && Category.get().getName().equals(category);
	}
}
