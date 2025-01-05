package com.exam.controller;

import com.exam.model.ExamQuestion;
import com.exam.model.Question;
import com.exam.service.ExamQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
		return examQuestionService.getQuestionsNumberByExam(examId);
	}

	@GetMapping("/questions/{examId}/{flag}") // flag false is for admin and true for other users
	public List<Question> getQuestionsByExamByUserType(@PathVariable Long examId, @PathVariable Boolean flag) {
		return examQuestionService.getQuestionsByExam(examId, flag);
	}

	@GetMapping("/{id}")
	public ResponseEntity<ExamQuestion> getExamQuestionById(@PathVariable Long id) {
		return examQuestionService.getExamQuestionById(id).map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<?> addExamQuestion(@RequestBody ExamQuestion examQuestion) {
		try {
			return ResponseEntity.ok(examQuestionService.saveExamQuestion(examQuestion));
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Error adding question to exam: " + ex.getMessage()));
		}
	}

	@DeleteMapping
	public ResponseEntity<?> deleteExamQuestion(@RequestBody ExamQuestion examQuestion) {
		try {
			examQuestionService.deleteExamQuestionById(examQuestion);
			return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Error removing question from exam: " + ex.getMessage()));
		}
	}
}