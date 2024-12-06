package com.exam.controller;

import com.exam.model.DifficultyLookup;
import com.exam.service.DifficultyLookupService;
import java.util.List;
import java.util.Optional;
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
@RequestMapping("/difficulty")
@CrossOrigin(origins = "http://localhost:3000")
public class DifficultyLookupController {

    @Autowired
    private DifficultyLookupService defficultyLookupService;

    @PostMapping()
    public ResponseEntity<DifficultyLookup> createDifficuty(@RequestBody DifficultyLookup difficulty) {
    	DifficultyLookup savedDifficulty = defficultyLookupService.saveDifficulty(difficulty);
        return new ResponseEntity<>(savedDifficulty, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DifficultyLookup> getDifficultyById(@PathVariable Long id) {
        Optional<DifficultyLookup> difficulty = defficultyLookupService.getDifficultyById(id);
        return difficulty.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<DifficultyLookup> getAllDifficulty() {
        return defficultyLookupService.getAllDifficulty();
    }

    @PutMapping
    public ResponseEntity<DifficultyLookup> updateDifficulty( @RequestBody DifficultyLookup difficulty) {
        try {
        	DifficultyLookup updatedDifficulty = defficultyLookupService.updateDifficulty(difficulty);
            return ResponseEntity.ok(updatedDifficulty);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDifficulty(@PathVariable Long id) {
        try {
            defficultyLookupService.deleteDifficulty(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}