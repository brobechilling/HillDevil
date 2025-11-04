package com.example.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private static final Logger logger = LoggerFactory.getLogger(CloudinaryService.class);

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }
    @Transactional
    public String uploadFile(MultipartFile file, String folderName) {
        logger.info("cloudinary service - uploadFile called");

        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.MEDIA_EMPTY);
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folderName,
                            "resource_type", "auto",
                            "overwrite", true,
                            "use_filename", true
                    )
            );

            String url = (String) uploadResult.get("secure_url");
            if (url == null || url.isBlank()) {
                throw new AppException(ErrorCode.MEDIA_UPLOAD_FAILED);
            }

            logger.info("cloudinary service - upload success: {}", url);
            return url;

        } catch (IOException e) {
            logger.error("cloudinary service - upload failed: {}", e.getMessage());
            throw new AppException(ErrorCode.MEDIA_UPLOAD_FAILED);
        }
    }

    @Transactional
    public void deleteFile(String publicId) {
        logger.info("cloudinary service - deleteFile called for publicId={}", publicId);

        if (publicId == null || publicId.isBlank()) {
            throw new AppException(ErrorCode.MEDIA_NOT_FOUND);
        }

        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            Object status = result.get("result");

            if (!"ok".equals(status)) {
                logger.warn("cloudinary service - deleteFile failed: {}", result);
                throw new AppException(ErrorCode.MEDIA_DELETE_FAILED);
            }

            logger.info("cloudinary service - file deleted successfully");

        } catch (IOException e) {
            logger.error("cloudinary service - delete failed: {}", e.getMessage());
            throw new AppException(ErrorCode.MEDIA_DELETE_FAILED);
        }
    }
}
