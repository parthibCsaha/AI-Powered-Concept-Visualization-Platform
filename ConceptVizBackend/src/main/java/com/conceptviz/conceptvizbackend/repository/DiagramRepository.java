package com.conceptviz.conceptvizbackend.repository;

import com.conceptviz.conceptvizbackend.entity.Diagram;
import com.conceptviz.conceptvizbackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagramRepository extends JpaRepository<Diagram, Long> {
    List<Diagram> findByUserOrderByCreatedAtDesc(User user);
}