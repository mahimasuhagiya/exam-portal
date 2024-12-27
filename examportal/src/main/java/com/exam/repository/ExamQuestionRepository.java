package com.exam.repository;

import com.exam.model.Exam;
import com.exam.model.ExamQuestion;
import com.exam.model.Question;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Long> {
	List<ExamQuestion> findQestionByExam(Exam exam);
	ExamQuestion findByExamAndQuestion(Exam exam,Question question);
	int countQuestionByExam(Exam exam);
}
