package com.example.backend.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.entities.Area;

public interface AreaRepository extends JpaRepository<Area, UUID> {
}
