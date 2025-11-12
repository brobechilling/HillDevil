package com.example.backend.service;

import com.example.backend.dto.BranchMenuItemDTO;
import com.example.backend.dto.response.GuestBranchMenuItemDTO;
import com.example.backend.entities.BranchMenuItem;
import com.example.backend.entities.MenuItem;
import com.example.backend.entities.MenuItemStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.BranchMenuItemMapper;
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
    private final MenuItemRepository menuItemRepository;
    private final BranchRepository branchRepository;
    private final MediaService mediaService;
    private final BranchMenuItemMapper branchMenuItemMapper;

    public BranchMenuItemService(
            BranchMenuItemRepository branchMenuItemRepository,
            MenuItemRepository menuItemRepository,
            BranchRepository branchRepository,
            MediaService mediaService,
            BranchMenuItemMapper branchMenuItemMapper
    ) {
        this.branchMenuItemRepository = branchMenuItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.branchRepository = branchRepository;
        this.mediaService = mediaService;
        this.branchMenuItemMapper = branchMenuItemMapper;
    }

    public List<BranchMenuItemDTO> getMenuItemsByBranch(UUID branchId) {
        List<BranchMenuItem> branchMenuItems = branchMenuItemRepository.findAllByBranch_BranchId(branchId);

        UUID restaurantId = branchMenuItems.isEmpty()
                ? branchMenuItemRepository.findRestaurantIdByBranchId(branchId)
                : branchMenuItems.getFirst().getBranch().getRestaurant().getRestaurantId();

        List<MenuItem> activeItems = menuItemRepository.findAllByRestaurant_RestaurantIdAndStatus(restaurantId, MenuItemStatus.ACTIVE);

        List<UUID> itemIds = activeItems.stream().map(MenuItem::getMenuItemId).toList();
        Map<UUID, String> imageMap = mediaService.getLatestImageUrlsForTargets(itemIds, "MENU_ITEM_IMAGE");

        Map<UUID, BranchMenuItem> branchMenuItemMap = branchMenuItems.stream()
                .collect(Collectors.toMap(b -> b.getMenuItem().getMenuItemId(), b -> b));

        return activeItems.stream().map(menuItem -> {
            BranchMenuItem mapping = branchMenuItemMap.get(menuItem.getMenuItemId());
            BranchMenuItemDTO dto = new BranchMenuItemDTO();

            dto.setMenuItemId(menuItem.getMenuItemId());
            dto.setName(menuItem.getName());
            dto.setDescription(menuItem.getDescription());
            dto.setPrice(menuItem.getPrice());
            dto.setStatus(menuItem.getStatus());
            dto.setBestSeller(menuItem.isBestSeller());
            dto.setHasCustomization(menuItem.isHasCustomization());
            dto.setRestaurantId(menuItem.getRestaurant().getRestaurantId());
            dto.setCategoryId(menuItem.getCategory().getCategoryId());
            dto.setImageUrl(imageMap.get(menuItem.getMenuItemId()));

            if (mapping != null) {
                dto.setAvailable(mapping.isAvailable());
                dto.setBranchMenuItemId(mapping.getBranchMenuItemId());
            } else {
                dto.setAvailable(false);
            }

            dto.setBranchId(branchId);
            return dto;
        }).toList();
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

    public List<GuestBranchMenuItemDTO> getListBranchMenuItems(UUID branchId) {
        List<BranchMenuItem> branchMenuItems = branchMenuItemRepository.findAllByBranch_BranchId(branchId);
        if (branchMenuItems.isEmpty()) {
            throw new AppException(ErrorCode.BRANCH_NOTEXISTED);
        }
        List<GuestBranchMenuItemDTO> guestBranchMenuItemDTOs = branchMenuItems.stream().map(branchMenuItem -> branchMenuItemMapper.toGuestBranchMenuItemDTO(branchMenuItem)).toList();
        // Image handling
        Map<UUID, String> imageMap = mediaService.getLatestImageUrlsForTargets(guestBranchMenuItemDTOs.stream().map(branchMenuItem -> branchMenuItem.getMenuItemId()).toList(), "MENU_ITEM_IMAGE"); 
        for (GuestBranchMenuItemDTO guestBranchMenuItemDTO : guestBranchMenuItemDTOs) {
            guestBranchMenuItemDTO.setImageUrl(imageMap.get(guestBranchMenuItemDTO.getMenuItemId()));
        }
        return guestBranchMenuItemDTOs;
    }

}
