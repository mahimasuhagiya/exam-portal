package com.exam.service;

import com.exam.model.ExamQuestion;
import com.exam.model.Question;
import com.exam.repository.ExamQuestionRepository;
import com.exam.repository.QuestionsAttemptRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ExamQuestionService {

	@Autowired
	private ExamQuestionRepository examQuestionRepository;
	@Autowired
    private QuestionsAttemptRepository questionsAttemptRepository;
	
	public List<ExamQuestion> getAllExamQuestions() {
		return examQuestionRepository.findAll();
	}

	public List<Long> getQuestionsNumberByExam(Long examId) {
		List<ExamQuestion> examQuestions = examQuestionRepository.findQestionByExam_Id(examId);
		List<Long> questions = new ArrayList<Long>();
		for (ExamQuestion examQuestion : examQuestions) {
			questions.add(examQuestion.getQuestion().getId());
		}
		return questions;
	}

	public List<Question> getQuestionsByExam(Long examId, Boolean flag) {
		List<ExamQuestion> examQuestions = examQuestionRepository.findQestionByExam_Id(examId);
		List<Question> questions = new ArrayList<Question>();
		for (ExamQuestion examQuestion : examQuestions) {
			questions.add(examQuestion.getQuestion());
		}
		if (flag) {
			for (Question que : questions) {
				que.setCorrectAnswer(null);
				que.setDifficulty(null);
				que.setCategory(null);
			}
		}
		return questions;
	}

	public Optional<ExamQuestion> getExamQuestionById(Long id) {
		return examQuestionRepository.findById(id);
	}

	public ExamQuestion saveExamQuestion(ExamQuestion examQuestion) {
		if(questionsAttemptRepository.findByExam_Id(examQuestion.getExam().getId()) != 0) { 		
     		throw new RuntimeException("Exam is alredy attempted by students so question can not be removed.");
     	}
		 if(examQuestion.getExam().isActive()) { 		
     		throw new RuntimeException("Exam is active so question can not be removed. First deactivate the exam.");
     	}
		return examQuestionRepository.save(examQuestion);
	}

	public void deleteExamQuestionById(ExamQuestion examQuestion) {
		if(questionsAttemptRepository.findByExam_Id(examQuestion.getExam().getId()) != 0) { 		
     		throw new RuntimeException("Exam is alredy attempted by students so question can not be removed.");
     	}
		 if(examQuestion.getExam().isActive()) { 		
     		throw new RuntimeException("Exam is active so question can not be removed. First deactivate the exam.");
     	}
		examQuestionRepository.deleteById(examQuestion.getId());
	}
}