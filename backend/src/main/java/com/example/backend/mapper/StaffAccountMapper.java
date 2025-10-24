package com.example.backend.mapper;

import org.mapstruct.Mapper;

import com.example.backend.dto.StaffAccountDTO;
import com.example.backend.entities.StaffAccount;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface StaffAccountMapper {

    StaffAccountDTO toStaffAccountDTO(StaffAccount staffAccount);

    StaffAccount toStaffAccount(StaffAccountDTO staffAccountDTO);
    
}
