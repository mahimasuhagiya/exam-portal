package com.exam.service;

import com.exam.model.QuestionsAttempt;
import com.exam.repository.QuestionsAttemptRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionsAttemptService {
	@Autowired
	private QuestionsAttemptRepository questionsAttemptRepository;


	public QuestionsAttempt saveQuestionsAttempt(QuestionsAttempt questionsAttempt) {
		return questionsAttemptRepository.save(questionsAttempt);	
	}
	
	public List<Object[]> getUserExamAnswers(Long examId, Long userId) {
		return questionsAttemptRepository.findUserAnswerAndQuestionIdByExamIdAndQuestionId(examId,userId);	
	}
}