package com.example.backend.mapper;
import com.example.backend.dto.CategoryDTO;
import com.example.backend.entities.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category toCategory(CategoryDTO categoryDTO);
    CategoryDTO toCategoryDTO(Category category);
}
