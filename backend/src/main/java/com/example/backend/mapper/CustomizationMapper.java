package com.example.backend.mapper;

import com.example.backend.dto.CustomizationDTO;
import com.example.backend.entities.Customization;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomizationMapper {
    CustomizationDTO toCustomizationDTO(Customization customization);
    Customization toCustomization(CustomizationDTO customizationDTO);
}
