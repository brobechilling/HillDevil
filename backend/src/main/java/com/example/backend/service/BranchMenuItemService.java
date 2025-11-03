package com.example.backend.service;

import com.example.backend.dto.BranchMenuItemDTO;
import com.example.backend.dto.MenuItemDTO;
import com.example.backend.entities.BranchMenuItem;
import com.example.backend.entities.MenuItem;
import com.example.backend.entities.MenuItemStatus;
import com.example.backend.mapper.MenuItemMapper;
import com.example.backend.repository.BranchMenuItemRepository;
import com.example.backend.repository.BranchRepository;
import com.example.backend.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BranchMenuItemService {

    private final BranchMenuItemRepository branchMenuItemRepository;
    private final MenuItemMapper menuItemMapper;
    private final MenuItemRepository menuItemRepository;
    private final BranchRepository branchRepository;

    public BranchMenuItemService(
            BranchMenuItemRepository branchMenuItemRepository,
            MenuItemMapper menuItemMapper,
            MenuItemRepository menuItemRepository,
            BranchRepository branchRepository
    ) {
        this.branchMenuItemRepository = branchMenuItemRepository;
        this.menuItemMapper = menuItemMapper;
        this.menuItemRepository = menuItemRepository;
        this.branchRepository = branchRepository;
    }

    public List<BranchMenuItemDTO> getMenuItemsByBranch(UUID branchId) {
        List<BranchMenuItem> branchMenuItems = branchMenuItemRepository.findAllByBranch_BranchId(branchId);

        Map<UUID, BranchMenuItem> branchMenuItemMap = branchMenuItems.stream()
                .collect(Collectors.toMap(
                        bmi -> bmi.getMenuItem().getMenuItemId(),
                        bmi -> bmi
                ));

        UUID restaurantId = branchMenuItems.isEmpty()
                ? branchMenuItemRepository.findRestaurantIdByBranchId(branchId)
                : branchMenuItems.getFirst().getBranch().getRestaurant().getRestaurantId();

        List<MenuItem> activeItems =
                menuItemRepository.findAllByRestaurant_RestaurantIdAndStatus(restaurantId, MenuItemStatus.ACTIVE);

        return activeItems.stream().map(menuItem -> {
            MenuItemDTO base = menuItemMapper.toMenuItemDTO(menuItem);
            BranchMenuItemDTO dto = new BranchMenuItemDTO();

            dto.setMenuItemId(base.getMenuItemId());
            dto.setName(base.getName());
            dto.setDescription(base.getDescription());
            dto.setPrice(base.getPrice());
            dto.setStatus(base.getStatus());
            dto.setBestSeller(base.isBestSeller());
            dto.setHasCustomization(base.isHasCustomization());
            dto.setRestaurantId(base.getRestaurantId());
            dto.setCategoryId(base.getCategoryId());
            dto.setCustomizationIds(base.getCustomizationIds());
            dto.setImageUrl(base.getImageUrl());

            BranchMenuItem mapping = branchMenuItemMap.get(menuItem.getMenuItemId());
            if (mapping != null) {
                dto.setAvailable(mapping.isAvailable());
                dto.setBranchMenuItemId(mapping.getBranchMenuItemId());
                dto.setBranchId(branchId);
            } else {
                dto.setAvailable(false);
                dto.setBranchId(branchId);
            }

            return dto;
        }).collect(Collectors.toList());
    }



    public void updateAvailabilityByBranchAndMenuItem(UUID branchId, UUID menuItemId, boolean available) {
        BranchMenuItem entity = branchMenuItemRepository
                .findByBranch_BranchIdAndMenuItem_MenuItemId(branchId, menuItemId)
                .orElseGet(() -> {
                    BranchMenuItem newEntity = new BranchMenuItem();
                    newEntity.setBranch(branchRepository.findById(branchId)
                            .orElseThrow(() -> new RuntimeException("Branch not found")));
                    newEntity.setMenuItem(menuItemRepository.findById(menuItemId)
                            .orElseThrow(() -> new RuntimeException("Menu item not found")));
                    return newEntity;
                });

        entity.setAvailable(available);
        branchMenuItemRepository.save(entity);
    }
}
