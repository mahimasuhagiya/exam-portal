package com.exam.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

@Entity
public class Users {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String name;
	private String email;
	private int phone;
	private String address;
	@ManyToOne
	@JoinColumn(name = "college_id")
	private CollegeLookup college;

	private boolean isActive;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	@OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
	private List<questionsAttempt> attempts;

	@ManyToOne
	@JoinColumn(name = "role_id", referencedColumnName = "id")
	private UserRoleLookup role;

}
