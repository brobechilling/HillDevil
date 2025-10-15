package com.example.backend.service;

import com.example.backend.dto.PackageDTO;
import com.example.backend.entities.Package;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.PackageMapper;
import com.example.backend.repository.PackageRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PackageService {
    private final PackageRepository packageRepository;
    private final PackageMapper packageMapper;
    private final PackageFeatureService packageFeatureService;

    public PackageService(PackageRepository packageRepository,
                          PackageMapper packageMapper,
                          PackageFeatureService packageFeatureService) {
        this.packageRepository = packageRepository;
        this.packageMapper = packageMapper;
        this.packageFeatureService = packageFeatureService;
    }

    public List<PackageDTO> getAvailablePackages() {
        return packageRepository.findByIsAvailableTrue()
                .stream()
                .map(packageMapper::toPackageDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PackageDTO createPackage(PackageDTO dto) {
        Package pkg = packageMapper.toPackage(dto);
        pkg.setPackageId(UUID.randomUUID());
        pkg.setAvailable(true);

        Package saved = packageRepository.save(pkg);

        if (dto.getFeatures() != null && !dto.getFeatures().isEmpty()) {
            packageFeatureService.assignFeaturesToPackage(saved, dto.getFeatures());
        }

        return packageMapper.toPackageDto(saved);
    }

    @Transactional
    public PackageDTO updatePackage(UUID packageId, PackageDTO dto) {
        Package existing = packageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOTEXISTED));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setAvailable(dto.isAvailable());
        existing.setBillingPeriod(dto.getBillingPeriod());

        Package updated = packageRepository.save(existing);

        packageFeatureService.updatePackageFeatures(updated, dto.getFeatures());

        return packageMapper.toPackageDto(updated);
    }

    @Transactional
    public PackageDTO deactivatePackage(UUID packageId) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOTEXISTED));

        pkg.setAvailable(false);
        return packageMapper.toPackageDto(packageRepository.save(pkg));
    }
}
