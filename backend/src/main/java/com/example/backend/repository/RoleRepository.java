package com.example.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entities.Role;

public interface RoleRepository extends JpaRepository<Role, UUID> {

}
