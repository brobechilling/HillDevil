package com.example.backend.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.response.AreaResponse;
import com.example.backend.repository.AreaRepository;

@Service
public class AreaService {

    private final AreaRepository areaRepository;

    public AreaService(AreaRepository areaRepository) {
        this.areaRepository = areaRepository;
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
}