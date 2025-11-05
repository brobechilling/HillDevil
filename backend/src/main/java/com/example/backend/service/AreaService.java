package com.example.backend.service;

import java.util.List;
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

            // Create new area
            Area area = new Area();
            area.setBranch(branch);
            area.setName(request.getName().trim());
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
        Area area = areaRepository.findById(areaId)
                .orElseThrow(() -> new AppException(ErrorCode.AREA_NOT_FOUND));
        
        // Check if area has tables
        if (!tableRepository.findAllByAreaId(areaId).isEmpty()) {
            throw new AppException(ErrorCode.AREA_HAS_TABLES);
        }
        
        areaRepository.delete(area);
    }
}