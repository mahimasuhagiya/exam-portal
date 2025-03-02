package com.exam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.exam.model.Exam;
import com.exam.model.Result;
import com.exam.service.ExamService;
import com.exam.service.ResultService;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/exams")
public class ExamController {

	@Autowired
	private ExamService examService;
	@Autowired
	private ResultService resultService;
	
	@Autowired
	public ExamController(ExamService examService) {
		this.examService = examService;
	}

	@GetMapping
	public ResponseEntity<?> getAllExams() {
		try {
			List<Exam> exams = examService.getAllExams();
			return ResponseEntity.ok(exams);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Error retrieving exams: " + e.getMessage()));
		}
	}
	@GetMapping("/count")
    public Long countExams() {
        return examService.countExams();
    }
	@GetMapping("/active_count")
    public Long countActiveExams() {
        return examService.countActiveExams();
    }

	@GetMapping("/active/{userId}")
	public ResponseEntity<?> getAllActiveExamsByStudents(@PathVariable Long userId) {
		try {
			List<Exam> exams = examService.getAllActiveExams();
			List<Exam> examsToRemove = new ArrayList<>();
			for(Exam ex : exams) {
				Optional<Result> res = resultService.getResultByExamAndUser(ex.getId(), userId);
				if(res.isPresent()) {
					examsToRemove.add(ex);
				}
			}
			exams.removeAll(examsToRemove);
			return ResponseEntity.ok(exams);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Error retrieving exams: " + e.getMessage()));
		}
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getExamById(@PathVariable Long id) {
		Optional<Exam> exam = examService.getExamById(id);
		return exam.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<?> createExam(@RequestBody Exam exam) {
		try {
			Exam createdExam = examService.createExam(exam);
			return ResponseEntity.status(HttpStatus.CREATED).body(createdExam);
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Error creating exam: " + ex.getMessage()));
		}
	}
	@PostMapping("/CreateWithQuestions")
	public ResponseEntity<?> createExamWithQuestions(@RequestBody Exam exam) {
		try {
			Exam createdExam = examService.createExamWithQuestions(exam);
			return ResponseEntity.status(HttpStatus.CREATED).body(createdExam);
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Error creating exam: " + ex.getMessage()));
		}
	}

	@PutMapping
	public ResponseEntity<?> updateExam(@RequestBody Exam examDetails) {
		try {
			Exam updatedExam = examService.updateExam(examDetails);
			return ResponseEntity.ok(updatedExam);
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Error updating exam: " + ex.getMessage()));
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> deleteExam(@PathVariable Long id) {
		try {
			Optional<Exam> exam = examService.getExamById(id);
			if (exam.isPresent()) {
				examService.deleteExam(id);
				return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
			} else {
				return ResponseEntity.status(HttpStatus.NOT_FOUND)
						.body(Map.of("message", "Exam not found with id: " + id));
			}
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Error deleting exam: " + ex.getMessage()));
		}
	}

	@PutMapping("/status/{id}")
	public ResponseEntity<?> updateExamStatus(@PathVariable Long id) {
		try {
			Exam exam = examService.updateExamStatus(id);
			return ResponseEntity.ok(exam);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Error retrieving exams: " + e.getMessage()));
		}
	}

}
