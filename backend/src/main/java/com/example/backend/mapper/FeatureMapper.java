package com.example.backend.mapper;

import com.example.backend.dto.FeatureDTO;
import com.example.backend.entities.Feature;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FeatureMapper {
    FeatureDTO toFeatureDto(Feature feature);
    Feature toFeature(FeatureDTO featureDTO);
}
