package com.exam.controller;

import com.exam.model.Exam;
import com.exam.model.ExamQuestion;
import com.exam.model.Question;
import com.exam.service.ExamQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/exam_questions")
public class ExamQuestionController {

	@Autowired
	private ExamQuestionService examQuestionService;

	@GetMapping
	public List<ExamQuestion> getAllExamQuestions() {
		return examQuestionService.getAllExamQuestions();
	}

	@GetMapping("/exam/{examId}")
	public List<Long> getQuestionsNumberByExam(@PathVariable Long examId) {
		Exam exam = new Exam();
		exam.setId(examId);
		return examQuestionService.getQuestionsNumberByExam(exam);
	}

	@GetMapping("/questions/{examId}")
	public List<Question> getQuestionsByExam(@PathVariable Long examId) {
		Exam exam = new Exam();
		exam.setId(examId);
		return examQuestionService.getQuestionsByExam(exam);
	}

	
	@GetMapping("/{id}")
	public ResponseEntity<ExamQuestion> getExamQuestionById(@PathVariable Long id) {
		return examQuestionService.getExamQuestionById(id).map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public ExamQuestion addExamQuestion(@RequestBody ExamQuestion examQuestion) {
		return examQuestionService.saveExamQuestion(examQuestion);
	}

	@DeleteMapping
	public ResponseEntity<Void> deleteExamQuestion(@RequestBody ExamQuestion examQuestion) {
		examQuestionService.deleteExamQuestionById(examQuestion);
		return ResponseEntity.noContent().build();
	}
}