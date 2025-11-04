package com.example.backend.service;

import com.example.backend.dto.MediaDTO;
import com.example.backend.entities.Media;
import com.example.backend.entities.TargetType;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.MediaMapper;
import com.example.backend.repository.MediaRepository;
import com.example.backend.repository.TargetTypeRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MediaService {

    private final MediaRepository mediaRepository;
    private final TargetTypeRepository targetTypeRepository;
    private final CloudinaryService cloudinaryService;
    private final MediaMapper mediaMapper;
    private final Logger logger = LoggerFactory.getLogger(MediaService.class);

    public MediaService(MediaRepository mediaRepository,
                        TargetTypeRepository targetTypeRepository,
                        CloudinaryService cloudinaryService,
                        MediaMapper mediaMapper) {
        this.mediaRepository = mediaRepository;
        this.targetTypeRepository = targetTypeRepository;
        this.cloudinaryService = cloudinaryService;
        this.mediaMapper = mediaMapper;
    }

    public List<MediaDTO> getAll() {
        List<Media> list = mediaRepository.findAll();
        return list.isEmpty()
                ? List.of()
                : list.stream().map(mediaMapper::toMediaDTO).toList();
    }

    public List<MediaDTO> getByTarget(UUID targetId, String targetTypeCode) {
        TargetType targetType = targetTypeRepository.findByCode(targetTypeCode)
                .orElseThrow(() -> new AppException(ErrorCode.TARGET_TYPE_NOT_FOUND));

        List<Media> medias = mediaRepository.findByTargetIdAndTargetType(targetId, targetType);
        return medias.stream()
                .map(mediaMapper::toMediaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MediaDTO upload(MultipartFile file, UUID targetId, String targetTypeCode) {
        TargetType targetType = targetTypeRepository.findByCode(targetTypeCode)
                .orElseThrow(() -> new AppException(ErrorCode.TARGET_TYPE_NOT_FOUND));

        String folder = targetTypeCode.toLowerCase();
        String url = cloudinaryService.uploadFile(file, folder);

        Media media = new Media();
        media.setTargetId(targetId);
        media.setTargetType(targetType);
        media.setUrl(url);
        media.setStatus(true);

        Media saved = mediaRepository.save(media);
        logger.info("✅ Uploaded media: {} (targetType={}, targetId={})", saved.getMediaId(), targetTypeCode, targetId);

        return mediaMapper.toMediaDTO(saved);
    }

    @Transactional
    public void delete(UUID mediaId) {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new AppException(ErrorCode.MEDIA_NOT_FOUND));
        media.setStatus(false);
        mediaRepository.save(media);
        logger.info("🟡 Disabled media: {}", mediaId);
    }

    private String extractPublicIdFromUrl(String url) {
        if (url == null) return null;
        String[] parts = url.split("/");
        String filename = parts[parts.length - 1];
        int dotIndex = filename.lastIndexOf('.');
        return dotIndex != -1 ? filename.substring(0, dotIndex) : filename;
    }

    @Transactional
    public void saveMediaForTarget(MultipartFile file, UUID targetId, String targetTypeCode) {
        TargetType targetType = targetTypeRepository.findByCode(targetTypeCode)
                .orElseThrow(() -> new AppException(ErrorCode.TARGET_TYPE_NOT_FOUND));

        String folder = targetTypeCode.toLowerCase();
        String url = cloudinaryService.uploadFile(file, folder);

        Media media = new Media();
        media.setTargetId(targetId);
        media.setTargetType(targetType);
        media.setUrl(url);
        media.setStatus(true);

        mediaRepository.save(media);
        logger.info("✅ Saved media for targetId={} (type={})", targetId, targetTypeCode);
    }

    @Transactional
    public void deleteAllMediaForTarget(UUID targetId, String targetTypeCode) {
        TargetType targetType = targetTypeRepository.findByCode(targetTypeCode)
                .orElseThrow(() -> new AppException(ErrorCode.TARGET_TYPE_NOT_FOUND));

        List<Media> medias = mediaRepository.findByTargetIdAndTargetType(targetId, targetType);

        if (medias.isEmpty()) {
            logger.info("⚠️ No media found for targetId={} (type={})", targetId, targetTypeCode);
            return;
        }

        for (Media media : medias) {
            media.setStatus(false);
            mediaRepository.save(media);
            logger.info("🟡 Disabled media {} for targetId={}", media.getMediaId(), targetId);
        }
    }
    public String getImageUrlByTarget(UUID targetId, String targetTypeCode) {
        TargetType targetType = targetTypeRepository.findByCode(targetTypeCode)
                .orElseThrow(() -> new AppException(ErrorCode.TARGET_TYPE_NOT_FOUND));

        List<Media> medias = mediaRepository.findByTargetIdAndTargetType(targetId, targetType);
        return medias.isEmpty() ? null : medias.get(medias.size() - 1).getUrl();
    }

    public Map<UUID, String> getLatestImageUrlsForTargets(List<UUID> targetIds, String targetTypeCode) {
        if (targetIds.isEmpty()) return Map.of();

        TargetType targetType = targetTypeRepository.findByCode(targetTypeCode)
                .orElseThrow(() -> new AppException(ErrorCode.TARGET_TYPE_NOT_FOUND));

        List<Media> medias = mediaRepository.findByTargetIdInAndTargetType(targetIds, targetType);
        return medias.stream()
                .collect(Collectors.toMap(
                        Media::getTargetId,
                        Media::getUrl,
                        (url1, url2) -> url2  // lấy media mới nhất nếu trùng target
                ));
    }
}
