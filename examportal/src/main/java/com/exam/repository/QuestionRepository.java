package com.exam.repository;

import com.exam.model.Question;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
	List<Question> findByIsProgramming(Boolean isProgramming);
}
