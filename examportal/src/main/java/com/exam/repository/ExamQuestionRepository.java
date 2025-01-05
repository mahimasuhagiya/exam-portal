package com.exam.repository;

import com.exam.model.Exam;
import com.exam.model.ExamQuestion;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Long> {
	List<ExamQuestion> findQestionByExam_Id(Long examId);
	ExamQuestion findByExam_IdAndQuestion_Id(Long examId,Long questionId);
	List<ExamQuestion> findByQuestion_Id(Long questionId);
	int countQuestionByExam(Exam exam);
}
