package com.exam.repository;


import com.exam.model.QuestionsAttempt;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionsAttemptRepository extends JpaRepository<QuestionsAttempt, Long> {
	@Query("SELECT qa.user_answer, qa.exam_question.question.id FROM QuestionsAttempt qa WHERE qa.exam_question.exam.id = :examId AND qa.user.id = :userId")
	List<Object[]> findUserAnswerAndQuestionIdByExamIdAndQuestionId(@Param("examId") Long examId, @Param("userId") Long userId);
	
	@Query("SELECt count(qa.id) FROM QuestionsAttempt qa WHERE qa.exam_question.question.id = :questionId")
	int  findByQuestion_Id(Long questionId);
	
	@Query("SELECt count(qa.id) FROM QuestionsAttempt qa WHERE qa.exam_question.exam.id = :examId")
	int  findByExam_Id(Long examId);
}
