package com.example.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.dto.UserDTO;
import com.example.backend.dto.request.AuthenticationRequest;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;

@Service
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public UserDTO login(AuthenticationRequest authenticationRequest) {
        String mail = authenticationRequest.getEmail();
        String password = authenticationRequest.getPassword();
        return userMapper.toUserDto(userRepository.findByEmailAndPassword(mail, password).orElseThrow(() -> new AppException(ErrorCode.USER_NOTEXISTED)));
    }

    public List<UserDTO> getAll() {
        return userRepository.findAll().stream().map(user -> userMapper.toUserDto(user)).toList();
    }

}
