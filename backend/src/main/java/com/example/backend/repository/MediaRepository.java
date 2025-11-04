package com.example.backend.repository;

import com.example.backend.entities.Media;
import com.example.backend.entities.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<Media, UUID> {
    List<Media> findByTargetIdAndTargetType(UUID targetId, TargetType targetType);
    List<Media> findByTargetIdInAndTargetType(List<UUID> targetIds, TargetType targetType);
}
