package com.exam.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor 
@NoArgsConstructor 
public class DifficultyLookup {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String name;

	@OneToMany(mappedBy = "difficulty", cascade = CascadeType.ALL)
    @JsonIgnore
	private List<Question> questions;
	
	@OneToMany(mappedBy = "difficulty", cascade = CascadeType.ALL)
    @JsonIgnore
	private List<Exam> exams;

}
