package com.example.quanlynhansu.mapper;

import com.example.quanlynhansu.dto.SalarySlipDTO;
import com.example.quanlynhansu.entity.SalarySlip;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SalarySlipMapper{

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.fullName", target = "userName")
    SalarySlipDTO toDTO(SalarySlip entity);

    @Mapping(target = "user", ignore = true)
    SalarySlip toEntity(SalarySlipDTO dto);
}