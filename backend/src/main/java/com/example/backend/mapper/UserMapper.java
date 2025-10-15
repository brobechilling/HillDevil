package com.example.backend.mapper;

import org.mapstruct.Mapper;

import com.example.backend.dto.UserDTO;
import com.example.backend.dto.request.SignupRequest;
import com.example.backend.entities.User;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDTO toUserDto(User user);
    
    User toUser(UserDTO userDTO);

    User signUp(SignupRequest signupRequest);
}
