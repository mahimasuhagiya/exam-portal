package com.exam.service;

import com.exam.model.Exam;
import com.exam.model.User;
import com.exam.repository.ExamRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ExamService {

    private final ExamRepository examRepository;

    @Autowired
    public ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public Optional<Exam> getExamById(Long id) {
        return examRepository.findById(id);
    }

    public Exam createExam(Exam exam) {
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
        exam.setActive(!exam.isActive());
        return examRepository.save(exam);      
   }
}
