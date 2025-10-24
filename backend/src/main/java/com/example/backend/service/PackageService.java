package com.example.backend.service;

import com.example.backend.dto.PackageFeatureDTO;
import com.example.backend.entities.Package;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.PackageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PackageService {

    private final PackageRepository packageRepository;
    private final PackageFeatureService packageFeatureService;

    public PackageService(PackageRepository packageRepository,
                          PackageFeatureService packageFeatureService) {
        this.packageRepository = packageRepository;
        this.packageFeatureService = packageFeatureService;
    }

    @Transactional
    public PackageFeatureDTO createPackageWithFeatures(PackageFeatureDTO dto) {
        if (packageRepository.existsByName(dto.getName())) {
            throw new AppException(ErrorCode.PACKAGE_NAME_EXISTED);
        }

        Package pkg = new Package();
        pkg.setName(dto.getName());
        pkg.setDescription(dto.getDescription());
        pkg.setPrice(dto.getPrice());
        pkg.setAvailable(true);
        pkg.setBillingPeriod(dto.getBillingPeriod());

        Package savedPkg = packageRepository.save(pkg);

        if (dto.getFeatures() != null && !dto.getFeatures().isEmpty()) {
            for (var fv : dto.getFeatures()) {
                packageFeatureService.addOrUpdateFeature(savedPkg.getPackageId(), fv);
            }
        }

        return packageFeatureService.getPackageWithFeatures(savedPkg.getPackageId());
    }

    @Transactional
    public PackageFeatureDTO updatePackageWithFeatures(UUID packageId, PackageFeatureDTO dto) {
        Package existing = packageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOTEXISTED));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setAvailable(dto.isAvailable());
        existing.setBillingPeriod(dto.getBillingPeriod());
        packageRepository.save(existing);

        if (dto.getFeatures() != null && !dto.getFeatures().isEmpty()) {
            dto.getFeatures().forEach(fv -> packageFeatureService.addOrUpdateFeature(packageId, fv));
        }

        return packageFeatureService.getPackageWithFeatures(packageId);
    }

    @Transactional
    public void deactivatePackage(UUID packageId) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOTEXISTED));
        pkg.setAvailable(false);
        packageRepository.save(pkg);
    }

    @Transactional
    public void activatePackage(UUID packageId) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.PACKAGE_NOTEXISTED));
        pkg.setAvailable(true);
        packageRepository.save(pkg);
    }
}
