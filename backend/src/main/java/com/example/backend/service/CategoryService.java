package com.example.backend.service;

import com.example.backend.dto.CategoryDTO;
import com.example.backend.dto.request.CategoryCreateRequest;
import com.example.backend.entities.Category;
import com.example.backend.entities.Customization;
import com.example.backend.entities.Restaurant;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.CategoryMapper;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.CustomizationRepository;
import com.example.backend.repository.RestaurantRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final RestaurantRepository restaurantRepository;
    private final CustomizationRepository customizationRepository;
    private final Logger logger = LoggerFactory.getLogger(CategoryService.class);

    public CategoryService(CategoryRepository categoryRepository, CategoryMapper categoryMapper,
                           RestaurantRepository restaurantRepository, CustomizationRepository customizationRepository) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
        this.restaurantRepository = restaurantRepository;
        this.customizationRepository = customizationRepository;
    }

    public List<CategoryDTO> getAll() {
        logger.info("category service - getAll called");
        List<Category> categories = categoryRepository.findAll();
        if (categories.isEmpty()) {
            return Collections.emptyList();
        }
        return categories.stream().map(categoryMapper::toCategoryDTO).toList();
    }

    public CategoryDTO getById(UUID id) {
        logger.info("category service - getById called");
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return categoryMapper.toCategoryDTO(category);
    }

    @Transactional
    public CategoryDTO create(CategoryCreateRequest request) {
        Restaurant restaurant = null;
        if (request.getRestaurantId() != null) {
            restaurant = restaurantRepository.findById(request.getRestaurantId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
        }

        Category category = new Category();
        category.setName(request.getName());
        category.setRestaurant(restaurant);

        if (request.getCustomizationIds() != null && !request.getCustomizationIds().isEmpty()) {
            Set<Customization> customizations = request.getCustomizationIds().stream()
                    .map(id -> customizationRepository.findById(id)
                            .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND)))
                    .collect(Collectors.toSet());
            category.setCustomizations(customizations);
        }

        category.setCreatedAt(Instant.now());
        Category saved = categoryRepository.save(category);
        logger.info("category service - created");
        return categoryMapper.toCategoryDTO(saved);
    }

    @Transactional
    public CategoryDTO update(UUID id, CategoryDTO dto) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        existing.setName(dto.getName());
        existing.setUpdatedAt(Instant.now());

        if (dto.getCustomizationIds() != null) {
            Set<Customization> customizations = dto.getCustomizationIds().stream()
                    .map(cid -> customizationRepository.findById(cid)
                            .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND)))
                    .collect(Collectors.toSet());
            existing.setCustomizations(customizations);
        }
        logger.info("category service - update");
        return categoryMapper.toCategoryDTO(categoryRepository.save(existing));
    }

    @Transactional
    public void delete(UUID id) {
        categoryRepository.findById(id).ifPresent(category -> {
            category.setStatus(false);
            categoryRepository.save(category);
            logger.info("category service - deleted safely");
        });
    }
}
