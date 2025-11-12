package com.example.backend.service;

import com.example.backend.dto.CategoryDTO;
import com.example.backend.dto.request.CategoryCreateRequest;
import com.example.backend.entities.Category;
import com.example.backend.entities.Customization;
import com.example.backend.entities.FeatureCode;
import com.example.backend.entities.Restaurant;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.CategoryMapper;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.CustomizationRepository;
import com.example.backend.repository.RestaurantRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final RestaurantRepository restaurantRepository;
    private final CustomizationRepository customizationRepository;
    private final FeatureLimitCheckerService  featureLimitCheckerService;

    public CategoryService(CategoryRepository categoryRepository, CategoryMapper categoryMapper,
                           RestaurantRepository restaurantRepository, CustomizationRepository customizationRepository,
                           FeatureLimitCheckerService featureLimitCheckerService) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
        this.restaurantRepository = restaurantRepository;
        this.customizationRepository = customizationRepository;
        this.featureLimitCheckerService = featureLimitCheckerService;
    }

    public List<CategoryDTO> getAllByRestaurant(UUID restaurantId) {
        List<Category> categories = categoryRepository
                .findAllActiveByRestaurantOrDefault(restaurantId);

        return categories.stream()
                .map(categoryMapper::toCategoryDTO)
                .toList();
    }

    public CategoryDTO getById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return categoryMapper.toCategoryDTO(category);
    }

    @Transactional
    public CategoryDTO create(CategoryCreateRequest request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        Category category = new Category();
        category.setName(request.getName());
        category.setRestaurant(restaurant);
        category.setStatus(true);
        category.setCreatedAt(Instant.now());

        if (request.getCustomizationIds() != null && !request.getCustomizationIds().isEmpty()) {
            Set<Customization> customizations = request.getCustomizationIds().stream()
                    .map(id -> customizationRepository.findById(id)
                            .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND)))
                    .collect(Collectors.toSet());
            category.setCustomizations(customizations);
        }

        Category saved = categoryRepository.save(category);
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

            UUID restaurantId = existing.getRestaurant().getRestaurantId();

            Supplier<Long> newCountSupplier = () -> (long) customizations.size();

            featureLimitCheckerService.checkLimit(
                    restaurantId,
                    FeatureCode.LIMIT_CUSTOMIZATION_PER_CATEGORY,
                    newCountSupplier
            );

            existing.setCustomizations(customizations);
        }

        return categoryMapper.toCategoryDTO(categoryRepository.save(existing));
    }

    @Transactional
    public void delete(UUID id) {
        categoryRepository.findById(id).ifPresent(category -> {
            category.setStatus(false);
            categoryRepository.save(category);
        });
    }
}

