package com.exam.controller;

import java.util.List;
import java.util.Map;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.exam.model.User;
import com.exam.repository.UserRepository;
import com.exam.service.ExcelService;
import com.exam.service.UserService;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    @Autowired
    private ExcelService excelService;

    @Autowired
    private UserRepository userRepository;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping
    public ResponseEntity<?> registerUser(@RequestBody User user) {
    	 try {
    	        User registeredUser = userService.registerUser(user);
    	        return ResponseEntity.ok(registeredUser);
    	    } catch (Exception ex) {
    	        return ResponseEntity
    	                .status(HttpStatus.INTERNAL_SERVER_ERROR)
    	                .body(Map.of("message", "Error registering user: " + ex.getMessage()));
    	    }
    }

    @PostMapping("/upload")
    public String uploadUsers(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return "Please upload a valid Excel file.";
        }

        try {
            List<User> users = excelService.parseExcelFile(file);
            userRepository.saveAll(users);
            return "Successfully uploaded " + users.size() + " users.";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

  // @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EXAMINER')")
    @GetMapping()
    public List<User> getAllUsers() {
            return userService.getAllUsers();
    }
    
    @GetMapping("/student_count")
    public Long countStudents() {
        return userService.countStudents();
    }
   
	@GetMapping("/{id}")
	public ResponseEntity<User> getUserById(@PathVariable Long id) {
		Optional<User> user = userService.getUserById(id);
		return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}
	
	@GetMapping("role/{role}")
	public List<User> getAllUsersByRole(@PathVariable String role) {
		return userService.getAllUsersByRole(role);
	}
	
	@PutMapping
	public ResponseEntity<?> updateUser( @RequestBody User user) {
		try {
			User updatedUser = userService.updateUser( user);
			return ResponseEntity.ok(updatedUser);
		} catch (Exception ex) {
	        return ResponseEntity
	                .status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body(Map.of("message", "Error registering user: " + ex.getMessage()));
	    }
	}


	@PutMapping("/status/{id}")
	public ResponseEntity<User> updateUserStatus( @PathVariable Long id) {
		try {
			User updatedUser = userService.updateUserStatus( id);
			return ResponseEntity.ok(updatedUser);
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
		try {
			userService.deleteUser(id);
			return ResponseEntity.noContent().build();
		} catch (RuntimeException e) {
			return ResponseEntity.notFound().build();
		}
	}
}
