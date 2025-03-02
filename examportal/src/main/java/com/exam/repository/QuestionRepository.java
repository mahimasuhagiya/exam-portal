package com.exam.repository;

import com.exam.model.DifficultyLookup;
import com.exam.model.Question;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
	List<Question> findByIsProgramming(Boolean isProgramming);
	 List<Question> findByDifficulty(DifficultyLookup difficulty);
	    
	    @Query("SELECT DISTINCT q.difficulty FROM Question q")
	    List<DifficultyLookup> findAllDifficulties();
}
