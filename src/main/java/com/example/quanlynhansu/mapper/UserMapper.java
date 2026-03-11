package com.example.quanlynhansu.mapper;

import org.mapstruct.Mapper;
import com.example.quanlynhansu.dto.UserDTO;
import com.example.quanlynhansu.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDTO toDTO(User user);

    User toEntity(UserDTO dto);
}
