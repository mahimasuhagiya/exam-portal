package com.exam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.exam.model.CollegeLookup;
import com.exam.repository.CollegeLookupRepository;
import com.exam.service.CollegeLookupService;

import java.util.List;
import java.util.Optional;

@Service
public class CollegeLookupService{

	@Autowired
	private CollegeLookupRepository collegeLookupRepository;


	public CollegeLookup saveCollege(CollegeLookup college) {
		return collegeLookupRepository.save(college);
	}


	public Optional<CollegeLookup> getCollegeById(Long id) {
		return collegeLookupRepository.findById(id);
	}


	public List<CollegeLookup> getAllColleges() {
		return collegeLookupRepository.findAll();
	}


	public CollegeLookup updateCollege(Long id, CollegeLookup college) {
		if (collegeLookupRepository.existsById(id)) {
			college.setId(id);
			return collegeLookupRepository.save(college);
		}
		throw new RuntimeException("College not found with id " + id);
	}


	public void deleteCollege(Long id) {
		if (collegeLookupRepository.existsById(id)) {
			collegeLookupRepository.deleteById(id);
		} else {
			throw new RuntimeException("College not found with id " + id);
		}
	}
}
