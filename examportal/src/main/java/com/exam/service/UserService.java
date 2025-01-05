package com.exam.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.exam.model.Role;
import com.exam.model.User;
import com.exam.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private BCryptPasswordEncoder passwordEncoder;

	public User registerUser(User user) {
		if (isEmailExist(user.getEmail())) {
			throw new IllegalArgumentException("Email already exists.");
		}
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		if (user.getRole().equals(null)) {
			user.setRole(Role.STUDENT);
		}
		user.setActive(true);
		user.setCreatedAt(LocalDateTime.now());
		return userRepository.save(user);
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Optional<User> usernameOptional = userRepository.findByEmail(username);
		if (usernameOptional.isPresent()) {
			User user = usernameOptional.get();
			GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());

			return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPassword(),
					List.of(authority));
		} else {
			throw new UsernameNotFoundException("Username not found");
		}
	}

	public long countStudents() {
		Role studentRole = Role.valueOf("STUDENT");
		return userRepository.countByRole(studentRole);
	}

	public List<User> getAllUsers() {
		List<User> users = userRepository.findAll();
		return users;

	}

	public List<User> getAllUsersByRole(String role) {
		Role userRole = Role.valueOf(role.toUpperCase());
		List<User> users = userRepository.findByRole(userRole);
		return users;
	}

	public Optional<User> getUserById(Long id) {
		Optional<User> user = userRepository.findById(id);
		return user;
	}

	public Optional<User> getUserByEmail(String email) {
		Optional<User> user = userRepository.findByEmail(email);
		if (user.isPresent()) {
			return user;
		} else {
			throw new UsernameNotFoundException("User not found");
		}
	}

	public User updateUser(User user) {
		// If updating email, validate its uniqueness
		if (isEmailExist(user.getEmail()) && !isSameEmail(user.getId(), user.getEmail())) {
			throw new RuntimeException("Email already exists.");
		}
		// user.setPassword(passwordEncoder.encode(user.getPassword()));
		if (userRepository.existsById(user.getId())) {
			user.setUpdatedAt(LocalDateTime.now());
			return userRepository.save(user);
		}
		throw new RuntimeException("User not found with id " + user.getId());
	}

	public User updateUserStatus(Long id) {
		User user = userRepository.findById(id).orElse(null);
		if (user == null) {
			throw new RuntimeException("User not found with id " + id);
		}
		user.setActive(!user.isActive());
		return userRepository.save(user);
	}

	public void deleteUser(Long id) {
		if (!userRepository.existsById(id)) {
			throw new RuntimeException("User with ID " + id + " not found");
		}
		userRepository.deleteById(id);
	}

	// Helper method to check if the email exists
	private boolean isEmailExist(String email) {
		Optional<User> existingUser = userRepository.findByEmail(email);
		return existingUser.isPresent();
	}

	// Helper method to check if the email is the same as the user's current email
	// (for update case)
	private boolean isSameEmail(Long id, String email) {
		Optional<User> user = userRepository.findById(id);
		return user.isPresent() && user.get().getEmail().equals(email);
	}

}
