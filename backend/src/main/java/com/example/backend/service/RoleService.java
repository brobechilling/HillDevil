package com.example.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.dto.RoleDTO;
import com.example.backend.mapper.RoleMapper;
import com.example.backend.repository.RoleRepository;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    public RoleService(RoleRepository roleRepository, RoleMapper roleMapper) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
    }

    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll().stream().map(role -> roleMapper.toRoleDTO(role)).toList();
    }

    
}
