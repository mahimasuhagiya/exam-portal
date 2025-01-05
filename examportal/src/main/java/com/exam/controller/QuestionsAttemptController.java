package com.exam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.exam.model.Exam;
import com.exam.model.ExamQuestion;
import com.exam.model.Question;
import com.exam.model.QuestionsAttempt;
import com.exam.model.Result;
import com.exam.model.User;
import com.exam.repository.ExamQuestionRepository;
import com.exam.service.ExamService;
import com.exam.service.QuestionService;
import com.exam.service.QuestionsAttemptService;
import com.exam.service.ResultService;
import com.exam.service.UserService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/questions_attempt")
public class QuestionsAttemptController {
	@Autowired
	private QuestionsAttemptService questionsAttemptService;
	@Autowired
	private ExamService examService;
	@Autowired
	private QuestionService questionService;
	@Autowired
	private UserService userService;
	@Autowired
	private ExamQuestionRepository examQuestionRepository;
	@Autowired
	private ResultService resultService;

	@PostMapping("/{examId}/{userId}")
	public ResponseEntity<Void> createQuestionsAttempt(@PathVariable Long examId, @PathVariable Long userId,
			@RequestBody HashMap<Long, String> answers) {
		Optional<Exam> exam = examService.getExamById(examId);
		Optional<User> user = userService.getUserById(userId);
		int total = 0;
		Optional<Result> res = resultService.getResultByExamAndUser(examId,userId);
		if (res.isEmpty()) {
			for (Map.Entry<Long, String> entry : answers.entrySet()) {
				Long questionId = entry.getKey();
				String answer = entry.getValue();

				Optional<Question> question = questionService.getQuestionById(questionId);
				if(!exam.get().isProgramming()){
				if (question.get().getCorrectAnswer().equals(answer)) {
					total += 1;
				}}
				
				ExamQuestion examQuestion = examQuestionRepository.findByExam_IdAndQuestion_Id(examId, questionId);

				QuestionsAttempt questionsAttempt = new QuestionsAttempt();
				questionsAttempt.setExam_question(examQuestion);
				questionsAttempt.setUser_answer(answer);
				questionsAttempt.setUser(user.get());
				System.out.println(questionsAttempt);
				questionsAttemptService.saveQuestionsAttempt(questionsAttempt);
			}
			Result result = new Result();
			result.setExam(exam.get());
			result.setUser(user.get());
			result.setTotal(total);
			result.setGeneratedAt(LocalDateTime.now());
			resultService.saveResult(result);

			return new ResponseEntity<>(HttpStatus.CREATED);
		}
		else {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}
	@GetMapping("/{examId}/{userId}")
	public List<Object[]> getUserExamAnswers(@PathVariable Long examId, @PathVariable Long userId){
		return questionsAttemptService.getUserExamAnswers(examId, userId);
	}

}