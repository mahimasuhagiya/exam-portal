package com.exam.service;

import com.exam.model.Exam;
import com.exam.model.User;
import com.exam.repository.ExamQuestionRepository;
import com.exam.repository.ExamRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    
    @Autowired
    public ExamService(ExamRepository examRepository, ExamQuestionRepository examQuestionRepository) {
        this.examRepository = examRepository;
        this.examQuestionRepository = examQuestionRepository;
    }
    
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }
    public List<Exam> getAllActiveExams() {
        return examRepository.findByIsActive(true);
    }
    public Optional<Exam> getExamById(Long id) {
        return examRepository.findById(id);
    }

    public Exam createExam(Exam exam) {
    	exam.setActive(false);
        return examRepository.save(exam);
    }

    public Exam updateExam(Exam examDetails) {
        Exam existingExam = examRepository.findById(examDetails.getId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        return examRepository.save(examDetails);
    }

    public void deleteExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        examRepository.delete(exam);
    }
    
    public Exam updateExamStatus( Long id) {
   	 Exam exam = examRepository.findById(id).orElse(null);
        if (exam == null) {
       	 throw new RuntimeException("Exam not found with id " + id);
        }
        if(!exam.isActive())
        {
        	int numberOfQuestions = examQuestionRepository.countQuestionByExam(exam);
        	if(numberOfQuestions==exam.getNumberOfQuestions()) {        		
        		exam.setActive(true);
        	}
        	else {
        		throw new RuntimeException("The exam must containt "+exam.getNumberOfQuestions() + " questions to be active but the only containts " + numberOfQuestions + " number of questions");
        	}
        }
        else {
        	exam.setActive(false);
        }
        return examRepository.save(exam);      
   }
}
