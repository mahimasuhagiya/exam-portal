package com.exam.controller;

import java.util.Map;
import java.util.Optional;

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
import com.exam.model.User;
import com.exam.service.UserService;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

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


  // @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_EXAMINER')")
    @GetMapping()
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getAllUsers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
   
	@GetMapping("/{id}")
	public ResponseEntity<User> getUserById(@PathVariable Long id) {
		Optional<User> user = userService.getUserById(id);
		return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}
	
	@GetMapping("role/{role}")
	public ResponseEntity<?> getAllUsersByRole(@PathVariable String role) {
		try {
            return ResponseEntity.ok(userService.getAllUsersByRole(role));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
	}
	
	@PutMapping
	public ResponseEntity<User> updateUser( @RequestBody User user) {
		try {
			User updatedUser = userService.updateUser( user);
			return ResponseEntity.ok(updatedUser);
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
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
