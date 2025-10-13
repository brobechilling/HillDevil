package com.example.backend.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.UserDTO;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDTO> getAll() {
        return userRepository.findAll().stream().map(user -> userMapper.toUserDto(user)).toList();
    }

    public List<UserDTO> hashSeedPassword() {
        List<User> users = userRepository.findAll();
        users.forEach(user -> user.setPassword(passwordEncoder.encode(user.getPassword())));
        return userRepository.saveAll(users).stream().map(user -> userMapper.toUserDto(user)).toList();
    }

    
}
