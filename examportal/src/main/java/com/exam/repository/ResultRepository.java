package com.exam.repository;

import com.exam.model.Result;
import com.exam.model.User;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
	Optional<Result> findByExam_IdAndUser_Id(Long examId, Long userId);
	List<Result> findByExam_IsProgramming(Boolean flag);
	Long countByExam_IsProgrammingAndCheckedByAndTotal(Boolean isProgramming, User checkedBy,int total);
}
