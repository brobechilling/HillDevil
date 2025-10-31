package com.example.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.StaffAccountDTO;
import com.example.backend.dto.request.CreateStaffAccountRequest;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.entities.Branch;
import com.example.backend.entities.Restaurant;
import com.example.backend.entities.Role;
import com.example.backend.entities.RoleName;
import com.example.backend.entities.StaffAccount;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.StaffAccountMapper;
import com.example.backend.repository.BranchRepository;
import com.example.backend.repository.RestaurantRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.StaffAccountRepository;

@Service
public class StaffAccountService {

    private final StaffAccountRepository staffAccountRepository;
    private final StaffAccountMapper staffAccountMapper;
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestaurantRepository restaurantRepository;

    public StaffAccountService(StaffAccountRepository staffAccountRepository, StaffAccountMapper staffAccountMapper, RoleRepository roleRepository, BranchRepository branchRepository, PasswordEncoder passwordEncoder, RestaurantRepository restaurantRepository) {
        this.staffAccountRepository = staffAccountRepository;
        this.staffAccountMapper = staffAccountMapper;
        this.roleRepository = roleRepository;
        this.branchRepository = branchRepository;
        this.passwordEncoder = passwordEncoder;
        this.restaurantRepository = restaurantRepository;
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

    public StaffAccountDTO updateStaffAccount(StaffAccountDTO staffAccountDTO) {
        StaffAccount staffAccount = staffAccountRepository.findById(staffAccountDTO.getStaffAccountId()).orElseThrow(() -> new AppException(ErrorCode.STAFFACCOUNT_NOTEXISTED));
        Role role = roleRepository.findByName(staffAccountDTO.getRole().getName()).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOTEXISTED));
        staffAccount.setRole(role);        
        staffAccount.setUsername(staffAccountDTO.getUsername());
        staffAccount.setStatus(staffAccount.isStatus());
        return staffAccountMapper.toStaffAccountDTO(staffAccountRepository.save(staffAccount));
    }

    public StaffAccountDTO setStaffAccountStatus(UUID staffAccountId) {
        StaffAccount staffAccount = staffAccountRepository.findById(staffAccountId).orElseThrow(() -> new AppException(ErrorCode.STAFFACCOUNT_NOTEXISTED));
        staffAccount.setStatus(!staffAccount.isStatus());
        return staffAccountMapper.toStaffAccountDTO(staffAccountRepository.save(staffAccount));
    }

    public PageResponse<StaffAccountDTO> getStaffAccountPaginated(int page, int size, UUID branchId) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Branch branch = branchRepository.findById(branchId).orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        Page<StaffAccount> pageData = staffAccountRepository.findByBranchAndRole_NameNot(branch, RoleName.BRANCH_MANAGER, pageable);
        PageResponse<StaffAccountDTO> pageResponse = new PageResponse<>();
        pageResponse.setItems(pageData.map(staffAccount -> staffAccountMapper.toStaffAccountDTO(staffAccount)).toList());
        pageResponse.setTotalElements(pageData.getTotalElements());
        pageResponse.setTotalPages(pageData.getTotalPages());
        return pageResponse;
    }

    public long getRoleNumber(UUID branchId, RoleName roleName) {
        Branch branch = branchRepository.findById(branchId).orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        return staffAccountRepository.countByBranchAndRole_Name(branch, roleName);
    }

    public PageResponse<StaffAccountDTO> getStaffAccountByRestaurantPaginated(int page, int size, UUID restaurantId) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
        Page<StaffAccount> pageData = staffAccountRepository.findByBranch_Restaurant_RestaurantId(restaurantId, pageable);
        PageResponse<StaffAccountDTO> pageResponse = new PageResponse<>();
        pageResponse.setItems(pageData.map(staffAccount -> staffAccountMapper.toStaffAccountDTO(staffAccount)).toList());
        pageResponse.setTotalElements(pageData.getTotalElements());
        pageResponse.setTotalPages(pageData.getTotalPages());
        return pageResponse;
    }

}
