package com.exam.service;
import com.exam.model.Exam;
import com.exam.model.ExamQuestion;
import com.exam.model.Question;
import com.exam.repository.ExamQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ExamQuestionService {

    @Autowired
    private ExamQuestionRepository examQuestionRepository;

    public List<ExamQuestion> getAllExamQuestions() {
        return examQuestionRepository.findAll();
    }
    public List<Long> getQuestionsNumberByExam(Exam exam) {
       List<ExamQuestion> examQuestions = examQuestionRepository.findQestionByExam(exam);
       List<Long> questions = new ArrayList<Long>();
       for (ExamQuestion examQuestion : examQuestions) {
           questions.add(examQuestion.getQuestion().getId());
       }
       return questions;
    }
    
    public List<Question> getQuestionsByExam(Exam exam) {
        List<ExamQuestion> examQuestions = examQuestionRepository.findQestionByExam(exam);
        List<Question> questions = new ArrayList<Question>();
        for (ExamQuestion examQuestion : examQuestions) {
            questions.add(examQuestion.getQuestion());
        }
        for (Question que : questions) {
            que.setCorrectAnswer(0);
            que.setDifficulty(null);
            que.setCategory(null);
        }
        return questions;
     }
     
    
    public Optional<ExamQuestion> getExamQuestionById(Long id) {
        return examQuestionRepository.findById(id);
    }

    public ExamQuestion saveExamQuestion(ExamQuestion examQuestion) {
        return examQuestionRepository.save(examQuestion);
    }

    public void deleteExamQuestionById(ExamQuestion examQestion) {
    	ExamQuestion examq = examQuestionRepository.findByExamAndQuestion(examQestion.getExam(), examQestion.getQuestion());
        examQuestionRepository.deleteById(examq.getId());
    }
}