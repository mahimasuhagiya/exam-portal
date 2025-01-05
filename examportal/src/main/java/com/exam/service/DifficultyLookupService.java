package com.exam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.exam.model.DifficultyLookup;
import com.exam.repository.DifficultyLookupRepository;
import com.exam.service.DifficultyLookupService;

import java.util.List;

@Service
public class DifficultyLookupService {

	@Autowired
	private DifficultyLookupRepository difficultyLookupRepository;

	public DifficultyLookup saveDifficulty(DifficultyLookup difficulty) {
		
		return difficultyLookupRepository.save(difficulty);
	}

	public List<DifficultyLookup> getAllDifficulty() {
		return difficultyLookupRepository.findAll();
	}

	public DifficultyLookup updateDifficulty(DifficultyLookup difficulty) {
		return difficultyLookupRepository.save(difficulty);
	}

	public void deleteDifficulty(Long id) {
		difficultyLookupRepository.deleteById(id);
	}
}
