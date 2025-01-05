package com.exam.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.exam.model.QuestionCategoryLookup;
public interface QuestionCategoryLookupRepository  extends JpaRepository<QuestionCategoryLookup, Long>{
	Optional<QuestionCategoryLookup> findByName(String username);
}
