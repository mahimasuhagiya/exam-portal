package com.exam.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.exam.model.DifficultyLookup;

public interface DifficultyLookupRepository  extends JpaRepository<DifficultyLookup, Long>{

}
