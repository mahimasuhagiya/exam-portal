package com.exam.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.exam.model.QuestionCategoryLookup;
public interface QuestionCategoryLookupRepository  extends JpaRepository<QuestionCategoryLookup, Long>{

}
