package com.example.backend.mapper;

import com.example.backend.dto.MediaDTO;
import com.example.backend.entities.Media;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface MediaMapper {

    @Mapping(source = "targetType.code", target = "targetTypeCode")
    MediaDTO toMediaDTO(Media media);

    @Mapping(target = "targetType", ignore = true) // set trực tiếp trong service
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Media toMedia(MediaDTO dto);
}
