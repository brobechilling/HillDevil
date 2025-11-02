package com.example.backend.mapper;

import com.example.backend.dto.BranchMenuItemDTO;
import com.example.backend.entities.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.UUID;

@Mapper(componentModel = "spring")
public interface BranchMenuItemMapper {

    @Mapping(target = "menuItemId", source = "menuItem.menuItemId")
    @Mapping(target = "name", source = "menuItem.name")
    @Mapping(target = "description", source = "menuItem.description")
    @Mapping(target = "price", source = "menuItem.price")
    @Mapping(target = "bestSeller", source = "menuItem.bestSeller")
    @Mapping(target = "hasCustomization", source = "menuItem.hasCustomization")
    @Mapping(target = "categoryId", source = "menuItem.category.categoryId")
    @Mapping(target = "branchId", source = "branch.branchId")
    BranchMenuItemDTO toBranchMenuItemDTO(BranchMenuItem entity);

    @Mapping(target = "branch", source = "branchId", qualifiedByName = "mapBranchFromId")
    @Mapping(target = "menuItem", source = "menuItemId", qualifiedByName = "mapMenuItemFromId")
    @Mapping(target = "branchMenuItemId", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    BranchMenuItem toBranchMenuItem(BranchMenuItemDTO dto);

    @Named("mapBranchFromId")
    default Branch mapBranchFromId(UUID id) {
        if (id == null) return null;
        Branch b = new Branch();
        b.setBranchId(id);
        return b;
    }

    @Named("mapMenuItemFromId")
    default MenuItem mapMenuItemFromId(UUID id) {
        if (id == null) return null;
        MenuItem m = new MenuItem();
        m.setMenuItemId(id);
        return m;
    }
}
