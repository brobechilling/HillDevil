package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.dto.StaffAccountDTO;
import com.example.backend.dto.StaffAccountInfo;
import com.example.backend.dto.request.CreateStaffAccountRequest;
import com.example.backend.entities.StaffAccount;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface StaffAccountMapper {

    @Mapping(target = "branchId", source = "branch.branchId")
    StaffAccountDTO toStaffAccountDTO(StaffAccount staffAccount);

    @Mapping(target = "branchId", source = "branch.branchId")
    StaffAccountInfo toStaffAccountInfo(StaffAccount staffAccount);

    StaffAccount toStaffAccount(StaffAccountDTO staffAccountDTO);

        
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "branch", ignore = true)
    StaffAccount createStaffAccount(CreateStaffAccountRequest createStaffAccountRequest);
    
}
