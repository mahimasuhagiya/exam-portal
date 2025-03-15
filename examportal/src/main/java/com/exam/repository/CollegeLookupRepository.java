package com.exam.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.exam.model.CollegeLookup;
public interface CollegeLookupRepository extends JpaRepository<CollegeLookup, Long>{
	CollegeLookup findByName(String name);
}
