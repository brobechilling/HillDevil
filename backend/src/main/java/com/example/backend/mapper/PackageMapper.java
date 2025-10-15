package com.example.backend.mapper;
import com.example.backend.entities.Package;
import com.example.backend.dto.PackageDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PackageMapper {

    public PackageDTO toPackageDto(Package p);
    public Package toPackage(PackageDTO packageDTO);
}
