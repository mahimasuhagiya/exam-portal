package com.exam.controller;

import com.exam.model.CollegeLookup;
import com.exam.service.CollegeLookupService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/colleges")
@CrossOrigin(origins = "http://localhost:3000")
public class CollegeLookupController {

    @Autowired
    private CollegeLookupService collegeService;

    @PostMapping()
    public ResponseEntity<CollegeLookup> createCollege(@RequestBody CollegeLookup college) {
        CollegeLookup savedCollege = collegeService.saveCollege(college);
        return new ResponseEntity<>(savedCollege, HttpStatus.CREATED);
    }

    @GetMapping
    public List<CollegeLookup> getAllColleges() {
        return collegeService.getAllColleges();
    }

    @PutMapping
    public ResponseEntity<CollegeLookup> updateCollege( @RequestBody CollegeLookup college) {
        try {
            CollegeLookup updatedCollege = collegeService.updateCollege(college);
            return ResponseEntity.ok(updatedCollege);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCollege(@PathVariable Long id) {
        try {
            collegeService.deleteCollege(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}