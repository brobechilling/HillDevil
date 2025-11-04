package com.example.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.UserDTO;
import com.example.backend.dto.request.ChangePasswordRequest;
import com.example.backend.dto.request.SignupRequest;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.entities.Role;
import com.example.backend.entities.RoleName;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    public UserService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }

    public List<UserDTO> getAll() {
        List<User> users = userRepository.findAll();
        return users.stream().filter(user -> user.isStatus()).map(user -> userMapper.toUserDto(user)).toList();
    }

    public List<UserDTO> getAllIncludeDeleted() {
        List<User> users = userRepository.findAll();
        return users.stream().map(user -> userMapper.toUserDto(user)).toList();
    }

    public List<UserDTO> hashSeedPassword() {
        List<User> users = userRepository.findAll();
        users.forEach(user -> user.setPassword(passwordEncoder.encode(user.getPassword())));
        return userRepository.saveAll(users).stream().map(user -> userMapper.toUserDto(user)).toList();
    }

    public UserDTO signUp(SignupRequest signupRequest) {
        // email should be unique
        userRepository.findByEmail(signupRequest.getEmail()).orElseThrow(() -> new AppException(ErrorCode.EMAIL_EXISTED));
        User newUser = userMapper.signUp(signupRequest);
        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        Role ownerRole = roleRepository.findByName(RoleName.RESTAURANT_OWNER).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOTEXISTED));
        newUser.setRole(ownerRole);
        return userMapper.toUserDto(userRepository.save(newUser));
    }

    public UserDTO getUserById(UUID userId) {
        return userMapper.toUserDto(userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED)));
    }

    public UserDTO setUserStatusById(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED));
        user.setStatus(!user.isStatus());
        return userMapper.toUserDto(userRepository.save(user));
    }

    public UserDTO updateUser(UserDTO userDTO) {
        User user = userRepository.findById(userDTO.getUserId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED));
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());
        user.setUsername(userDTO.getUsername());
        user.setRole(roleRepository.findByName(userDTO.getRole().getName()).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOTEXISTED)));
        // user.setStatus(userDTO.isStatus());
        return userMapper.toUserDto(userRepository.save(user));
    }
    
    public PageResponse<UserDTO> getUserPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        Page<User> pageData = userRepository.findByRole_NameNot(RoleName.ADMIN, pageable);
        PageResponse<UserDTO> pageResponse = new PageResponse<>();
        pageResponse.setItems(pageData.map(user -> userMapper.toUserDto(user)).toList());
        pageResponse.setTotalElements(pageData.getTotalElements());
        pageResponse.setTotalPages(pageData.getTotalPages());
        return pageResponse;
    }

    public boolean changePassword(ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findById(changePasswordRequest.getUserId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED));
        if(passwordEncoder.matches(changePasswordRequest.getPassword(), user.getPassword()))
        {
            user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
            userRepository.save(user);
            return true;
        }
        throw new AppException(ErrorCode.PASSWORD_NOTMATCH);
    }

}
