package com.exam.repository;

import com.exam.model.Exam;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
	List<Exam> findByIsActive(Boolean flag);
	Long countByIsActive(Boolean flag);
}
