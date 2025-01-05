package com.exam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.exam.model.CollegeLookup;
import com.exam.repository.CollegeLookupRepository;
import com.exam.service.CollegeLookupService;

import java.util.List;

@Service
public class CollegeLookupService {

	@Autowired
	private CollegeLookupRepository collegeLookupRepository;

	public CollegeLookup saveCollege(CollegeLookup college) {
		return collegeLookupRepository.save(college);
	}

	public List<CollegeLookup> getAllColleges() {
		return collegeLookupRepository.findAll();
	}

	public CollegeLookup updateCollege(CollegeLookup college) {
		return collegeLookupRepository.save(college);
	}

	public void deleteCollege(Long id) {
		collegeLookupRepository.deleteById(id);
	}
}
