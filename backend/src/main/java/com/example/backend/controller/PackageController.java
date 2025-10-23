package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.PackageFeatureDTO;
import com.example.backend.service.PackageFeatureService;
import com.example.backend.service.PackageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/packages")
public class PackageController {

    private static final Logger log = LoggerFactory.getLogger(PackageController.class);

    private final PackageService packageService;
    private final PackageFeatureService packageFeatureService;

    public PackageController(PackageService packageService,
                             PackageFeatureService packageFeatureService) {
        this.packageService = packageService;
        this.packageFeatureService = packageFeatureService;
    }

    @GetMapping("")
    public ApiResponse<List<PackageFeatureDTO>> getAllPackages() {
        ApiResponse<List<PackageFeatureDTO>> response = new ApiResponse<>();
        response.setResult(packageFeatureService.getAllPackagesWithFeatures());
        return response;
    }

    @GetMapping("/{packageId}")
    public ApiResponse<PackageFeatureDTO> getPackage(@PathVariable UUID packageId) {
        ApiResponse<PackageFeatureDTO> response = new ApiResponse<>();
        response.setResult(packageFeatureService.getPackageWithFeatures(packageId));
        return response;
    }

    @PostMapping("")
    public ApiResponse<PackageFeatureDTO> createPackage(@RequestBody PackageFeatureDTO dto) {
        log.info("Received createPackage request: name={}, description={}, price={}, billingPeriod={}, features={}",
                dto.getName(), dto.getDescription(), dto.getPrice(), dto.getBillingPeriod(), dto.getFeatures());

        ApiResponse<PackageFeatureDTO> response = new ApiResponse<>();
        PackageFeatureDTO savedPkg = packageService.createPackageWithFeatures(dto);

        log.info("Package created successfully with id: {}", savedPkg.getPackageId());
        if (savedPkg.getFeatures() != null) {
            savedPkg.getFeatures().forEach(f ->
                    log.info("Feature added: {} - value {}", f.getFeatureName(), f.getValue())
            );
        }

        response.setResult(savedPkg);
        return response;
    }

    @PutMapping("/{packageId}")
    public ApiResponse<PackageFeatureDTO> updatePackage(@PathVariable UUID packageId,
                                                        @RequestBody PackageFeatureDTO dto) {
        log.info("Received updatePackage request: packageId={}, dto={}", packageId, dto);

        ApiResponse<PackageFeatureDTO> response = new ApiResponse<>();
        PackageFeatureDTO updatedPkg = packageService.updatePackageWithFeatures(packageId, dto);

        log.info("Package updated successfully with id: {}", updatedPkg.getPackageId());
        if (updatedPkg.getFeatures() != null) {
            updatedPkg.getFeatures().forEach(f ->
                    log.info("Feature updated: {} - value {}", f.getFeatureName(), f.getValue())
            );
        }

        response.setResult(updatedPkg);
        return response;
    }

    @DeleteMapping("/{packageId}/features/{featureId}")
    public ApiResponse<Void> deleteFeatureFromPackage(@PathVariable UUID packageId,
                                                      @PathVariable UUID featureId) {
        ApiResponse<Void> response = new ApiResponse<>();
        packageFeatureService.deleteFeatureFromPackage(packageId, featureId);
        response.setResult(null);
        return response;
    }

    @PutMapping("/{packageId}/deactivate")
    public ApiResponse<Void> deactivatePackage(@PathVariable UUID packageId) {
        log.info("Received deactivatePackage request: packageId={}", packageId);

        ApiResponse<Void> response = new ApiResponse<>();
        packageService.deactivatePackage(packageId);

        log.info("Package {} deactivated successfully", packageId);
        response.setResult(null);
        return response;
    }

    @PutMapping("/{packageId}/activate")
    public ApiResponse<Void> activatePackage(@PathVariable UUID packageId) {
        log.info("Received activatePackage request: packageId={}", packageId);

        ApiResponse<Void> response = new ApiResponse<>();
        packageService.activatePackage(packageId);

        log.info("Package {} activated successfully", packageId);
        response.setResult(null);
        return response;
    }

}


