package com.example.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.StaffAccountDTO;
import com.example.backend.dto.request.CreateStaffAccountRequest;
import com.example.backend.dto.request.ResetPasswordRequest;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.dto.response.ResetPasswordResponse;
import com.example.backend.entities.Branch;
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
        
        // Lưu password gốc trước khi hash để trả về cho client
        String plainPassword = staffAccount.getPassword();
        staffAccount.setPassword(passwordEncoder.encode(plainPassword));
        
        StaffAccount savedAccount = staffAccountRepository.save(staffAccount);
        StaffAccountDTO dto = staffAccountMapper.toStaffAccountDTO(savedAccount);
        
        // Set password gốc vào DTO để trả về cho client (Manager/Owner có thể xem)
        dto.setPassword(plainPassword);
        
        return dto;
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
        // Validate restaurant exists
        restaurantRepository.findById(restaurantId).orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
        Page<StaffAccount> pageData = staffAccountRepository.findByBranch_Restaurant_RestaurantId(restaurantId, pageable);
        PageResponse<StaffAccountDTO> pageResponse = new PageResponse<>();
        pageResponse.setItems(pageData.map(staffAccount -> staffAccountMapper.toStaffAccountDTO(staffAccount)).toList());
        pageResponse.setTotalElements(pageData.getTotalElements());
        pageResponse.setTotalPages(pageData.getTotalPages());
        return pageResponse;
    }

    @Transactional(readOnly = true)
    public StaffAccountDTO getStaffAccountById(UUID staffAccountId) {
        StaffAccount staffAccount = staffAccountRepository.findByIdWithDetails(staffAccountId)
                .orElseThrow(() -> new AppException(ErrorCode.STAFFACCOUNT_NOTEXISTED));
        // Force initialization of lazy-loaded entities before mapping
        if (staffAccount.getRole() != null) {
            staffAccount.getRole().getName();
        }
        if (staffAccount.getBranch() != null) {
            staffAccount.getBranch().getBranchId();
        }
        return staffAccountMapper.toStaffAccountDTO(staffAccount);
    }

    @Transactional
    public ResetPasswordResponse resetPassword(UUID staffAccountId, ResetPasswordRequest request) {
        StaffAccount staffAccount = staffAccountRepository.findById(staffAccountId)
                .orElseThrow(() -> new AppException(ErrorCode.STAFFACCOUNT_NOTEXISTED));
        
        String newPassword;
        
        // Nếu có custom password trong request thì dùng, nếu không thì auto generate
        if (request != null && request.hasCustomPassword()) {
            // Validate custom password (ít nhất 6 ký tự)
            String customPassword = request.getNewPassword().trim();
            if (customPassword.length() < 6) {
                throw new AppException(ErrorCode.INVALID_PASSWORD);
            }
            newPassword = customPassword;
        } else {
            // Generate a random password
            newPassword = generateRandomPassword();
        }
        
        // Hash and save the new password
        staffAccount.setPassword(passwordEncoder.encode(newPassword));
        staffAccountRepository.save(staffAccount);
        
        // Return the plain text password in response
        ResetPasswordResponse response = new ResetPasswordResponse();
        response.setStaffAccountId(staffAccount.getStaffAccountId());
        response.setUsername(staffAccount.getUsername());
        response.setNewPassword(newPassword);
        
        return response;
    }
    
    private String generateRandomPassword() {
        // Generate a random password with 10 characters: mix of uppercase, lowercase, and numbers
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder password = new StringBuilder();
        java.util.Random random = new java.util.Random();
        for (int i = 0; i < 10; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }

}
