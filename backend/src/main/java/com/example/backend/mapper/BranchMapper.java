package com.example.backend.mapper;

import org.mapstruct.Mapper;

import com.example.backend.dto.BranchDTO;
import com.example.backend.entities.Branch;

@Mapper(componentModel = "spring")
public interface BranchMapper {
    
    BranchDTO toBranchDTO(Branch branch);

    Branch toBranch(BranchDTO branch);
    
}