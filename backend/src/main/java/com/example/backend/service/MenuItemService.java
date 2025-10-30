package com.example.backend.service;

import com.example.backend.dto.MenuItemDTO;
import com.example.backend.dto.request.MenuItemCreateRequest;
import com.example.backend.entities.*;
import com.example.backend.entities.MenuItemStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.MenuItemMapper;
import com.example.backend.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final MenuItemMapper menuItemMapper;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;
    private final CustomizationRepository customizationRepository;
    private final BranchMenuItemRepository branchMenuItemRepository;

    public MenuItemService(MenuItemRepository menuItemRepository, MenuItemMapper menuItemMapper,
                           RestaurantRepository restaurantRepository, CategoryRepository categoryRepository,
                           CustomizationRepository customizationRepository, BranchMenuItemRepository branchMenuItemRepository) {
        this.menuItemRepository = menuItemRepository;
        this.menuItemMapper = menuItemMapper;
        this.restaurantRepository = restaurantRepository;
        this.categoryRepository = categoryRepository;
        this.customizationRepository = customizationRepository;
        this.branchMenuItemRepository = branchMenuItemRepository;
    }

    public List<MenuItemDTO> getAll() {
        List<MenuItem> list = menuItemRepository.findAll();
        return list.isEmpty()
                ? Collections.emptyList()
                : list.stream().map(menuItemMapper::toMenuItemDTO).toList();
    }

    public MenuItemDTO getById(UUID id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));
        return menuItemMapper.toMenuItemDTO(item);
    }

    /** Tạo mới MenuItem */
    @Transactional
    public MenuItemDTO create(MenuItemCreateRequest request) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        MenuItem item = new MenuItem();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setBestSeller(request.isBestSeller());
        item.setHasCustomization(request.isHasCustomization());
        item.setStatus(MenuItemStatus.ACTIVE);
        item.setRestaurant(restaurant);
        item.setCategory(category);
        item.setCreatedAt(Instant.now());

        if (request.getCustomizationIds() != null && !request.getCustomizationIds().isEmpty()) {
            Set<Customization> customizations = request.getCustomizationIds().stream()
                    .map(id -> customizationRepository.findById(id)
                            .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND)))
                    .collect(Collectors.toSet());
            item.setCustomizations(customizations);
        }

        MenuItem savedItem = menuItemRepository.save(item);

        // Tự động gán cho tất cả chi nhánh
        Set<Branch> branches = restaurant.getBranches();
        if (branches != null && !branches.isEmpty()) {
            for (Branch branch : branches) {
                BranchMenuItem bmi = new BranchMenuItem();
                bmi.setBranch(branch);
                bmi.setMenuItem(savedItem);
                bmi.setAvailable(false);
                branchMenuItemRepository.save(bmi);
            }
        }

        return menuItemMapper.toMenuItemDTO(savedItem);
    }

    @Transactional
    public MenuItemDTO update(UUID id, MenuItemDTO dto) {
        return menuItemRepository.findById(id)
                .map(exist -> {
                    exist.setName(dto.getName());
                    exist.setDescription(dto.getDescription());
                    exist.setPrice(dto.getPrice());
                    exist.setBestSeller(dto.isBestSeller());
                    exist.setHasCustomization(dto.isHasCustomization());
                    exist.setUpdatedAt(Instant.now());
                    return menuItemMapper.toMenuItemDTO(menuItemRepository.save(exist));
                })
                .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));
    }

    @Transactional
    public void setActiveStatus(UUID menuItemId, boolean active) {
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));
        item.setStatus(active ? MenuItemStatus.ACTIVE : MenuItemStatus.INACTIVE);
        item.setUpdatedAt(Instant.now());
        menuItemRepository.save(item);
    }

    @Transactional
    public void delete(UUID id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));

        item.setStatus(MenuItemStatus.DELETED);
        item.setUpdatedAt(Instant.now());
        menuItemRepository.save(item);

        List<BranchMenuItem> mappings = branchMenuItemRepository.findAll()
                .stream()
                .filter(bmi -> bmi.getMenuItem().getMenuItemId().equals(id))
                .toList();
        branchMenuItemRepository.deleteAll(mappings);
    }

    public boolean isMenuItemActiveInBranch(UUID menuItemId, UUID branchId) {
        return branchMenuItemRepository.existsByBranch_BranchIdAndMenuItem_MenuItemIdAndAvailableTrue(branchId, menuItemId);
    }
}
