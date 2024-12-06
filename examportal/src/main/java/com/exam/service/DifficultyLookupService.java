package com.exam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.exam.model.DifficultyLookup;
import com.exam.repository.DifficultyLookupRepository;
import com.exam.service.DifficultyLookupService;

import java.util.List;
import java.util.Optional;

@Service
public class DifficultyLookupService{

	@Autowired
	private DifficultyLookupRepository difficultyLookupRepository;


	public DifficultyLookup saveDifficulty(DifficultyLookup difficulty) {
		return difficultyLookupRepository.save(difficulty);
	}


	public Optional<DifficultyLookup> getDifficultyById(Long id) {
		return difficultyLookupRepository.findById(id);
	}


	public List<DifficultyLookup> getAllDifficulty() {
		return difficultyLookupRepository.findAll();
	}


	public DifficultyLookup updateDifficulty(DifficultyLookup difficulty) {
		if (difficultyLookupRepository.existsById(difficulty.getId())) {
			difficulty.setId(difficulty.getId());
			return difficultyLookupRepository.save(difficulty);
		}
		throw new RuntimeException("Difficulty level not found");
	}


	public void deleteDifficulty(Long id) {
		if (difficultyLookupRepository.existsById(id)) {
			difficultyLookupRepository.deleteById(id);
		} else {
			throw new RuntimeException("Difficulty level not found");
		}
	}
}
