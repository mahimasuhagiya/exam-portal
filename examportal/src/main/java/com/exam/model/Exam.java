package com.exam.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Exam {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String title;
	@ManyToOne
	@JoinColumn(name = "difficulty_level_id")
	private DifficultyLookup difficulty;
	private int durationMinutes;
	private int passingMarks;
	private int numberOfQuestions;
	private boolean isActive;

	@OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
	@JsonIgnore
	private List<questionsAttempt> attempts;
	@OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
	@JsonIgnore
	private List<ExamQuestion> examQuestions;

}
