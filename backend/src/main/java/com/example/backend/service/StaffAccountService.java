package com.example.backend.service;

import java.util.List;

import com.example.backend.dto.StaffAccountDTO;
import com.example.backend.entities.StaffAccount;
import com.example.backend.mapper.StaffAccountMapper;
import com.example.backend.repository.StaffAccountRepository;

public class StaffAccountService {

    private final StaffAccountRepository staffAccountRepository;
    private final StaffAccountMapper staffAccountMapper;

    public StaffAccountService(StaffAccountRepository staffAccountRepository, StaffAccountMapper staffAccountMapper) {
        this.staffAccountRepository = staffAccountRepository;
        this.staffAccountMapper = staffAccountMapper;
    }

    public List<StaffAccountDTO> getAllStaffAccounts() {
        return staffAccountRepository.findAll().stream().map(staff -> staffAccountMapper.toStaffAccountDTO(staff)).toList();
    }

    public StaffAccountDTO createStaffAccount(StaffAccountDTO staffAccountDTO) {
        StaffAccount staffAccount = staffAccountMapper.toStaffAccount(staffAccountDTO);
        return null;
    }

}
