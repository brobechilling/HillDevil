package com.example.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.request.CreateAreaRequest;
import com.example.backend.dto.response.AreaResponse;
import com.example.backend.entities.Area;
import com.example.backend.entities.Branch;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.AreaRepository;
import com.example.backend.repository.BranchRepository;
import com.example.backend.repository.TableRepository;

@Service
public class AreaService {

    private final AreaRepository areaRepository;
    private final BranchRepository branchRepository;
    private final TableRepository tableRepository;

    public AreaService(AreaRepository areaRepository, BranchRepository branchRepository, TableRepository tableRepository) {
        this.areaRepository = areaRepository;
        this.branchRepository = branchRepository;
        this.tableRepository = tableRepository;
    }

    @Transactional(readOnly = true)
    public List<AreaResponse> getAreasByBranch(UUID branchId) {
        return areaRepository.findByBranchBranchId(branchId)
                .stream()
                .filter(area -> area.isStatus()) // Chỉ lấy area có status = true
                .map(area -> new AreaResponse(
                        area.getAreaId(),
                        area.getName(),
                        area.isStatus()))
                .collect(Collectors.toList());
    }

    @Transactional
    public AreaResponse createArea(CreateAreaRequest request) {
        try {
            // Validate request
            if (request.getBranchId() == null) {
                throw new IllegalArgumentException("BranchId cannot be null");
            }
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Area name cannot be empty");
            }

            // Find branch
            Branch branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

            // Check if area with same name already exists (case-insensitive)
            String trimmedName = request.getName().trim();
            Optional<Area> existingArea = areaRepository.findByBranchBranchIdAndNameIgnoreCase(
                    request.getBranchId(), trimmedName);
            
            if (existingArea.isPresent()) {
                throw new AppException(ErrorCode.AREA_NAME_EXISTS);
            }

            // Create new area
            Area area = new Area();
            area.setBranch(branch);
            area.setName(trimmedName);
            area.setStatus(true); // Default to active

            area = areaRepository.save(area);

            return new AreaResponse(
                    area.getAreaId(),
                    area.getName(),
                    area.isStatus());
        } catch (AppException e) {
            // Re-throw AppException as-is
            throw e;
        } catch (Exception e) {
            // Log unexpected exceptions
            // System.err.println("Error creating area: " + e.getClass().getName());
            // System.err.println("Message: " + e.getMessage());
            // e.printStackTrace();
            throw new AppException(ErrorCode.WE_COOKED);
        }
    }

    @Transactional
    public void deleteArea(UUID areaId) {
        // Load area with branch (eager loading) to avoid LazyInitializationException
        Area area = areaRepository.findByIdWithBranch(areaId)
                .orElseThrow(() -> new AppException(ErrorCode.AREA_NOT_FOUND));
        
        // Get branchId from loaded area
        UUID branchId = area.getBranch().getBranchId();
        
        // Get all tables in this area
        List<com.example.backend.entities.AreaTable> tablesInArea = tableRepository.findAllByAreaId(areaId);
        
        // If area has tables, move them to "Undefined Area" (Unassigned Area)
        if (!tablesInArea.isEmpty()) {
            // Find or create default "Undefined Area" area
            Area defaultArea = findOrCreateUnassignedArea(branchId);
            
            // Move all tables to default area
            for (com.example.backend.entities.AreaTable table : tablesInArea) {
                table.setArea(defaultArea);
            }
            tableRepository.saveAll(tablesInArea);
        }
        
        // Delete the area (no check for tables - we already moved them)
        areaRepository.delete(area);
    }
    
    /**
     * Find or create the default "Undefined Area" (Unassigned Area) for a branch
     */
    private Area findOrCreateUnassignedArea(UUID branchId) {
        String defaultAreaName = "Undefined Area";
        
        // Try to find existing default area
        Optional<Area> existingDefaultArea = areaRepository.findByBranchBranchIdAndNameIgnoreCaseAnyStatus(
                branchId, defaultAreaName);
        
        if (existingDefaultArea.isPresent()) {
            Area area = existingDefaultArea.get();
            // Ensure it's active
            if (!area.isStatus()) {
                area.setStatus(true);
                area = areaRepository.save(area);
            }
            return area;
        }
        
        // Create new default area if not found
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));
        
        Area defaultArea = new Area();
        defaultArea.setBranch(branch);
        defaultArea.setName(defaultAreaName);
        defaultArea.setStatus(true);
        
        return areaRepository.save(defaultArea);
    }
}