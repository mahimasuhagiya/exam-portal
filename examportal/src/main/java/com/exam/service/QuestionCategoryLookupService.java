package com.exam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.exam.model.QuestionCategoryLookup;
import com.exam.repository.QuestionCategoryLookupRepository;
import com.exam.service.QuestionCategoryLookupService;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionCategoryLookupService{

	@Autowired
	private QuestionCategoryLookupRepository questionCategoryLookupRepository;


	public QuestionCategoryLookup saveQuestionCategory(QuestionCategoryLookup questionCategory) {
		return questionCategoryLookupRepository.save(questionCategory);
	}


	public Optional<QuestionCategoryLookup> getQuestionCategoryById(Long id) {
		return questionCategoryLookupRepository.findById(id);
	}


	public List<QuestionCategoryLookup> getAllQuestionCategories() {
		return questionCategoryLookupRepository.findAll();
	}


	public QuestionCategoryLookup updateQuestionCategory(QuestionCategoryLookup questionCategory) {
		if (questionCategoryLookupRepository.existsById(questionCategory.getId())) {
			questionCategory.setId(questionCategory.getId());
			return questionCategoryLookupRepository.save(questionCategory);
		}
		throw new RuntimeException("Question category not found with id " + questionCategory.getId());
	}


	public void deleteQuestionCategory(Long id) {
		if (questionCategoryLookupRepository.existsById(id)) {
			questionCategoryLookupRepository.deleteById(id);
		} else {
			throw new RuntimeException("Question category not found with id " + id);
		}
	}
}
