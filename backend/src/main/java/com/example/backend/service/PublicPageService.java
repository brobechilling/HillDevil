package com.example.backend.service;

import com.example.backend.dto.response.MenuPublicResponse;
import com.example.backend.dto.response.RestaurantPublicResponse;
import com.example.backend.dto.response.TableContextResponse;
import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.PublicPageMapper;
import com.example.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PublicPageService {

        private final RestaurantRepository restaurantRepository;
        private final BranchRepository branchRepository;
        private final TableRepository tableRepository;
        private final BranchMenuItemRepository branchMenuItemRepository;
        private final MenuItemRepository menuItemRepository;
        private final PublicPageMapper mapper;

        public PublicPageService(
                        RestaurantRepository restaurantRepository,
                        BranchRepository branchRepository,
                        TableRepository tableRepository,
                        BranchMenuItemRepository branchMenuItemRepository,
                        MenuItemRepository menuItemRepository,
                        PublicPageMapper mapper) {
                this.restaurantRepository = restaurantRepository;
                this.branchRepository = branchRepository;
                this.tableRepository = tableRepository;
                this.branchMenuItemRepository = branchMenuItemRepository;
                this.menuItemRepository = menuItemRepository;
                this.mapper = mapper;
        }

        public RestaurantPublicResponse getRestaurantBySlug(String slug) {
                // Accept either a name-based slug (e.g. "my-restaurant") or a restaurant UUID
                // string.
                Restaurant restaurant = null;
                try {
                        UUID id = UUID.fromString(slug);
                        restaurant = restaurantRepository.findById(id)
                                        .orElse(null);
                } catch (IllegalArgumentException ignored) {
                        // not a UUID, fall back to slug/publicUrl lookup
                }

                if (restaurant == null) {
                        String suffix = "/" + slug;
                        restaurant = restaurantRepository.findByPublicUrlEndingWith(suffix)
                                        .stream().findFirst()
                                        .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));
                }

                List<Branch> branches = branchRepository
                                .findByRestaurant_RestaurantIdAndIsActiveTrue(restaurant.getRestaurantId());

                List<RestaurantPublicResponse.BranchInfo> branchInfos = branches.stream()
                                .map(mapper::branchToBranchInfo)
                                .collect(Collectors.toList());

                RestaurantPublicResponse resp = new RestaurantPublicResponse();
                resp.setRestaurantId(restaurant.getRestaurantId());
                resp.setName(restaurant.getName());
                resp.setDescription(restaurant.getDescription());
                resp.setBranches(branchInfos);
                return resp;
        }

        // Table/QR context lookup disabled: guest landing should be reachable by
        // restaurant slug only.
        // public TableContextResponse getTableContext(UUID tableId) {
        // AreaTable table = tableRepository.findById(tableId)
        // .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));
        //
        // Branch branch = table.getArea().getBranch();
        // Restaurant restaurant = branch.getRestaurant();
        //
        // String publicUrl = restaurant.getPublicUrl();
        //
        // TableContextResponse resp = new TableContextResponse();
        // resp.setTableId(tableId);
        // resp.setTableTag(table.getTag());
        // resp.setBranchId(branch.getBranchId());
        // resp.setBranchAddress(branch.getAddress());
        // resp.setRestaurantName(restaurant.getName());
        // resp.setPublicUrl(publicUrl);
        // return resp;
        // }

        public MenuPublicResponse getBranchMenu(UUID branchId) {
                List<BranchMenuItem> bmis = branchMenuItemRepository.findByBranch_BranchId(branchId);

                List<MenuPublicResponse.MenuItemDTO> items = bmis.stream()
                                .filter(bmi -> bmi.isAvailable()
                                                && bmi.getMenuItem().getStatus() == MenuItemStatus.ACTIVE)
                                .map(bmi -> mapper.menuItemToMenuItemDTO(bmi.getMenuItem()))
                                .collect(Collectors.toList());

                MenuPublicResponse resp = new MenuPublicResponse();
                resp.setBranchId(branchId);
                resp.setItems(items);
                return resp;
        }
}
