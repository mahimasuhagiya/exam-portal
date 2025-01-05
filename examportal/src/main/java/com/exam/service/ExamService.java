package com.exam.service;

import com.exam.model.Exam;
import com.exam.repository.ExamQuestionRepository;
import com.exam.repository.ExamRepository;
import com.exam.repository.QuestionsAttemptRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ExamService {
	@Autowired
	private ExamRepository examRepository;
	@Autowired
	private ExamQuestionRepository examQuestionRepository;
	@Autowired
    private QuestionsAttemptRepository questionsAttemptRepository;
	
	public List<Exam> getAllExams() {
		return examRepository.findAll();
	}

	public List<Exam> getAllActiveExams() {
		return examRepository.findByIsActive(true);
	}
	public long countExams() {
		return examRepository.count();
	}
	public long countActiveExams() {
		return examRepository.countByIsActive(true);
	}
	public Optional<Exam> getExamById(Long id) {
		return examRepository.findById(id);
	}

	public Exam createExam(Exam exam) {
		exam.setActive(false);
		return examRepository.save(exam);
	}

	public Exam updateExam(Exam examDetails) {
			 if(questionsAttemptRepository.findByExam_Id(examDetails.getId()) != 0) { 		
	        		throw new RuntimeException("Exam is alredy attempted by students so can not edit the exam.");
	        	}
			 if(examDetails.isActive()) { 		
	        		throw new RuntimeException("Exam is active so can not edit the exam. First deactivate the exam.");
	        	}
		return examRepository.save(examDetails);
				 
	}

	public void deleteExam(Long id) {
		Optional<Exam> exam = examRepository.findById(id);
		examRepository.delete(exam.get());
	}

	public Exam updateExamStatus(Long id) {
		Exam exam = examRepository.findById(id).orElse(null);
		if (exam == null) {
			throw new RuntimeException("Exam not found with id " + id);
		}
		if (!exam.isActive()) {
			int numberOfQuestions = examQuestionRepository.countQuestionByExam(exam);
			if (numberOfQuestions == exam.getNumberOfQuestions()) {
				exam.setActive(true);
			} else {
				throw new RuntimeException("The exam must containt " + exam.getNumberOfQuestions()
						+ " questions to be active but the only containts " + numberOfQuestions
						+ " number of questions");
			}
		} else {
			exam.setActive(false);
		}
		return examRepository.save(exam);
	}
}
