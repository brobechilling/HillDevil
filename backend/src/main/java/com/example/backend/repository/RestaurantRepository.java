package com.example.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.Restaurant;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {
    List<Restaurant> findByUser_UserId(UUID userId);

    Page<Restaurant> findByStatus(Pageable pageable, boolean status);

    @EntityGraph(attributePaths = {
            "subscriptions", 
            "subscriptions.aPackage"
    })
    List<Restaurant> findAllByUser_UserId(UUID userId);
    @Query("SELECT r FROM Restaurant r WHERE r.publicUrl LIKE %:suffix")
    List<Restaurant> findByPublicUrlEndingWith(@Param("suffix") String suffix);
}