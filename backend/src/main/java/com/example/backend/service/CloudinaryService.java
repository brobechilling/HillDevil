package com.example.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }
    @Transactional
    public String uploadFile(MultipartFile file, String folderName) {
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

            return url;

        } catch (IOException e) {
            throw new AppException(ErrorCode.MEDIA_UPLOAD_FAILED);
        }
    }

    @Transactional
    public void deleteFile(String publicId) {

        if (publicId == null || publicId.isBlank()) {
            throw new AppException(ErrorCode.MEDIA_NOT_FOUND);
        }

        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            Object status = result.get("result");

            if (!"ok".equals(status)) {
                throw new AppException(ErrorCode.MEDIA_DELETE_FAILED);
            }


        } catch (IOException e) {
            throw new AppException(ErrorCode.MEDIA_DELETE_FAILED);
        }
    }
}
