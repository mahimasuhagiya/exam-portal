package com.exam.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.exam.model.Result;
import com.exam.model.User;
import com.exam.repository.ResultRepository;
import com.exam.repository.UserRepository;
import com.exam.service.ResultService;

@Service
public class ResultService{

	@Autowired
	private ResultRepository resultRepository;

	@Autowired
	private UserRepository userRepository;

	public Result saveResult(Result result) {
		return resultRepository.save(result);
	}
	public Long countPendingResults() {
		return resultRepository.countByExam_IsProgrammingAndCheckedByAndTotal(true,null,0);
	}
	public Result changeTotalOfResult(Long resultId,Long userId, int total) {
		Optional<Result> result = resultRepository.findById(resultId);
		Optional<User> user = userRepository.findById(userId);
		result.get().setTotal(total);
		result.get().setCheckedBy(user.get());
		return resultRepository.save(result.get());
	}
	
	public List<Result> getAllResult() {
		return resultRepository.findAll();
	}
	public List<Result> getResultExamType(Boolean flag) {
		return resultRepository.findByExam_IsProgramming(flag);
	}
	public Optional<Result> getResultByExamAndUser(Long examId, Long userId) {
		return resultRepository.findByExam_IdAndUser_Id(examId,userId);
	}	
}
