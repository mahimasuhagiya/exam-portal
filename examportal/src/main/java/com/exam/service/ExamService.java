package com.exam.service;

import com.exam.model.DifficultyLookup;
import com.exam.model.Exam;
import com.exam.model.ExamQuestion;
import com.exam.model.Question;
import com.exam.repository.ExamQuestionRepository;
import com.exam.repository.ExamRepository;
import com.exam.repository.QuestionRepository;
import com.exam.repository.QuestionsAttemptRepository;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
	@Autowired
	private QuestionRepository questionRepository;

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
	
	 public Exam createExamWithQuestions(Exam exam) {
	        // Save the exam first
		 	exam.setActive(false);
			Exam savedExam = examRepository.save(exam);
	        int totalQuestions = exam.getNumberOfQuestions();

	        // Get the selected difficulty level
	        DifficultyLookup selectedDifficulty = exam.getDifficulty();

	        // Fetch all available difficulty levels
	        List<DifficultyLookup> allDifficulties = questionRepository.findAllDifficulties();

	        // Ensure we have at least two difficulty levels
	        if (allDifficulties.size() < 2) {
	            throw new IllegalStateException("At least two difficulty levels are required to create an exam.");
	        }

	        // Allocate 50% of questions to the selected difficulty
	        int primaryCount = (int) (totalQuestions * 0.5);
	        int remainingCount = totalQuestions - primaryCount;
	        int otherDifficultyCount = remainingCount / (allDifficulties.size() - 1); // Divide equally

	        // Fetch questions for the selected difficulty
	        List<Question> primaryQuestions = questionRepository.findByDifficulty(selectedDifficulty);
	        Collections.shuffle(primaryQuestions);
	        List<Question> selectedQuestions = primaryQuestions.stream()
	            .limit(primaryCount)
	            .collect(Collectors.toList());

	        // Fetch questions for other difficulty levels
	        for (DifficultyLookup difficulty : allDifficulties) {
	            if (!difficulty.equals(selectedDifficulty)) {
	                List<Question> otherQuestions = questionRepository.findByDifficulty(difficulty);
	                Collections.shuffle(otherQuestions);
	                selectedQuestions.addAll(otherQuestions.stream()
	                    .limit(otherDifficultyCount)
	                    .collect(Collectors.toList()));
	            }
	        }

	        // Save selected questions in the ExamQuestion table
	        for (Question question : selectedQuestions) {
	            ExamQuestion examQuestion = new ExamQuestion();
	            examQuestion.setExam(savedExam);
	            examQuestion.setQuestion(question);
	            examQuestionRepository.save(examQuestion);
	        }

	        return savedExam;
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
