package com.exam.model;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class DifficultyLookup {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String name;

	@OneToMany(mappedBy = "difficulty", cascade = CascadeType.ALL)
	private List<Question> questions;
	
	@OneToMany(mappedBy = "difficulty", cascade = CascadeType.ALL)
	private List<Exam> exams;
}
