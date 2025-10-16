package com.example.backend.mapper;

import ch.qos.logback.core.model.ComponentModel;
import com.example.backend.dto.FeatureDTO;
import com.example.backend.dto.FeatureValueDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FeatureValueMapper {
    @Mapping(target = "id", source = "featureId")
    @Mapping(target = "name", source = "featureName")
    @Mapping(target = "description", source = "description")
    FeatureDTO toFeatureDto(FeatureValueDTO dto);
}
