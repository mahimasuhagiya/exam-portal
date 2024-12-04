package com.exam.model;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor 
@NoArgsConstructor 
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Lob
    private String question;
    @Lob
    private String optionA;
    private boolean isAImage;
    @Lob
    private String optionB;
    private boolean isBImage;
    @Lob
    private String optionC;
    private boolean isCImage;
    @Lob
    private String optionD;
    private boolean isDImage;
    private String correctAnswer;
    @ManyToOne
    @JoinColumn(name = "difficulty_level_id")
    private DifficultyLookup difficulty;
    
    @ManyToOne
    @JoinColumn(name = "question_category_id")
    private QuestionCategoryLookup category;
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
    private List<ExamQuestion> examQuestions;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
    private List<questionsAttempt> attempts;

	
}
