package com.example.backend.mapper;

import com.example.backend.dto.BranchMenuItemDTO;
import com.example.backend.dto.CategoryDTO;
import com.example.backend.entities.BranchMenuItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface BranchMenuItemMapper {
    BranchMenuItemDTO toBranchMenuItemDTO(BranchMenuItem  branchMenuItem);
    BranchMenuItem  toBranchMenuItem(BranchMenuItemDTO branchMenuItemDTO);
}
