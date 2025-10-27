package com.example.backend.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.StaffAccountDTO;
import com.example.backend.dto.request.CreateStaffAccountRequest;
import com.example.backend.entities.Branch;
import com.example.backend.entities.Role;
import com.example.backend.entities.StaffAccount;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.StaffAccountMapper;
import com.example.backend.repository.BranchRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.StaffAccountRepository;

@Service
public class StaffAccountService {

    private final StaffAccountRepository staffAccountRepository;
    private final StaffAccountMapper staffAccountMapper;
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffAccountService(StaffAccountRepository staffAccountRepository, StaffAccountMapper staffAccountMapper, RoleRepository roleRepository, BranchRepository branchRepository, PasswordEncoder passwordEncoder) {
        this.staffAccountRepository = staffAccountRepository;
        this.staffAccountMapper = staffAccountMapper;
        this.roleRepository = roleRepository;
        this.branchRepository = branchRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<StaffAccountDTO> getAllStaffAccounts() {
        return staffAccountRepository.findAll().stream().map(staff -> staffAccountMapper.toStaffAccountDTO(staff)).toList();
    }

    public StaffAccountDTO createStaffAccount(CreateStaffAccountRequest createStaffAccountRequest) {
        StaffAccount staffAccount = staffAccountMapper.createStaffAccount(createStaffAccountRequest);
        Role role = roleRepository.findByName(createStaffAccountRequest.getRole().getName()).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOTEXISTED));
        Branch branch = branchRepository.findById(createStaffAccountRequest.getBranchId()).orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        staffAccount.setRole(role);
        staffAccount.setBranch(branch);
        staffAccount.setPassword(passwordEncoder.encode(staffAccount.getPassword()));
        return staffAccountMapper.toStaffAccountDTO(staffAccountRepository.save(staffAccount));
    }


}
