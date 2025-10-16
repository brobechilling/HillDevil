package com.example.backend.mapper;

import com.example.backend.dto.PackageDTO;
import com.example.backend.entities.Package;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PackageMapper {

    @Mapping(target = "packageId", ignore = true)
    Package toPackage(PackageDTO dto);

    PackageDTO toPackageDto(Package pkg);
}
