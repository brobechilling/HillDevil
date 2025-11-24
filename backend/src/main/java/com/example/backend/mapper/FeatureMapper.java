package com.example.backend.mapper;

import com.example.backend.dto.FeatureDTO;
import com.example.backend.entities.Feature;
import com.example.backend.entities.FeatureCode;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface FeatureMapper {
    
    @Mapping(target = "id", source = "featureId")
    @Mapping(target = "hasValue", source = "code", qualifiedByName = "codeToHasValue")
    FeatureDTO toFeatureDto(Feature feature);
    
    @Mapping(target = "featureId", source = "id")
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "packageFeatures", ignore = true)
    Feature toFeature(FeatureDTO featureDTO);
    
    @Named("codeToHasValue")
    default boolean codeToHasValue(FeatureCode code) {
        // Features with value: all except UNLIMITED_BRANCH_CREATION
        // LIMIT_CUSTOMIZATION_PER_CATEGORY, LIMIT_MENU_ITEMS, LIMIT_BRANCH_CREATION have values
        if (code == null) {
            return false; // Custom features don't have value
        }
        return code != FeatureCode.UNLIMITED_BRANCH_CREATION;
    }
}
