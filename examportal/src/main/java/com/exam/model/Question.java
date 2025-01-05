package com.exam.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@AllArgsConstructor 
@NoArgsConstructor 
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Lob
    private String question;
    private String image;
    private boolean isProgramming;
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
    @Lob
    private String correctAnswer;
    @ManyToOne
    @JoinColumn(name = "difficulty_level_id")
    private DifficultyLookup difficulty;
    
    @ManyToOne
    @JoinColumn(name = "question_category_id")
    private QuestionCategoryLookup category;
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ExamQuestion> examQuestions;

}
