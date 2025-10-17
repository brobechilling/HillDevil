package com.example.backend.mapper;

import org.mapstruct.Mapper;

import com.example.backend.dto.RoleDTO;
import com.example.backend.entities.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    
    RoleDTO toRoleDTO(Role role);

}
