package com.exam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.exam.model.Role;
import com.exam.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String username);
	Optional<User> findByName(String username);
	List<User> findByRole(Role role);
	Long countByRole(Role role);
	boolean existsByEmail(String email);
}
