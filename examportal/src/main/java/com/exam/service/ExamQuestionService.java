package com.exam.service;

import com.exam.model.Exam;
import com.exam.model.ExamQuestion;
import com.exam.model.Question;
import com.exam.repository.ExamQuestionRepository;
import com.exam.repository.ExamRepository;
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
	@Autowired
    private ExamRepository examRepository;
	
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
	    if (examQuestion == null || examQuestion.getExam() == null) {
	        throw new RuntimeException("ExamQuestion or Exam cannot be null.");
	    }

	    // Check if the exam is already attempted
	    if (questionsAttemptRepository.findByExam_Id(examQuestion.getExam().getId()) > 0) {
	        throw new RuntimeException("Exam is already attempted by students, so questions cannot be modified.");
	    }

	    // Check if the exam is active
	    if (examQuestion.getExam().isActive()) {
	        throw new RuntimeException("Exam is active, so questions cannot be modified. First deactivate the exam.");
	    }

	    // Count the number of questions already added
	    int questionCount = examQuestionRepository.countQuestionByExam_Id(examQuestion.getExam().getId());
	    //not getting numberOfQuestions in exam object so fetching exam by examid and from there using numberOfQuestions
	    Optional<Exam> ex = examRepository.findById(examQuestion.getExam().getId());
	    int allowedQuestions = ex.get().getNumberOfQuestions();

	    // Prevent adding more questions than allowed
	    if (questionCount + 1 > allowedQuestions) {
	        throw new RuntimeException("Cannot add more questions. The exam already has the required number of questions.");
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
		 ExamQuestion eq = examQuestionRepository.findByExam_IdAndQuestion_Id(examQuestion.getExam().getId(),examQuestion.getQuestion().getId());
		examQuestionRepository.deleteById(eq.getId());
	}
}