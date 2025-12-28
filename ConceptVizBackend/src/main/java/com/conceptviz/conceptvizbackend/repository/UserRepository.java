package com.conceptviz.conceptvizbackend.repository;

import com.conceptviz.conceptvizbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<User> findByProviderIdAndAuthProvider(String providerId, User.AuthProvider authProvider);
}
