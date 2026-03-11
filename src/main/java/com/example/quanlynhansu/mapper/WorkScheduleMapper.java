package com.example.quanlynhansu.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.quanlynhansu.dto.WorkScheduleDTO;
import com.example.quanlynhansu.entity.User;
import com.example.quanlynhansu.entity.WorkSchedule;

@Mapper(componentModel = "spring")
public interface WorkScheduleMapper {

    @Mapping(source = "user.id", target = "userId")
    WorkScheduleDTO toDTO(WorkSchedule schedule);

    @Mapping(source = "userId", target = "user")
    WorkSchedule toEntity(WorkScheduleDTO dto);

    // helper để MapStruct biết cách tạo User từ id khi mapping DTO->Entity
    default User mapUserIdToUser(Long id) {
        if (id == null) return null;
        User u = new User();
        u.setId(id);
        return u;
    }

    // helper ngược lại (thường không cần nếu mapping source->target đã đủ)
    default Long mapUserToUserId(User user) {
        return user == null ? null : user.getId();
    }
}
