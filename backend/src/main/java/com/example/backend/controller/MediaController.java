package com.example.backend.controller;

import com.example.backend.dto.ApiResponse;
import com.example.backend.dto.MediaDTO;
import com.example.backend.service.MediaService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping("")
    public ApiResponse<List<MediaDTO>> getAll() {
        ApiResponse<List<MediaDTO>> res = new ApiResponse<>();
        res.setResult(mediaService.getAll());
        return res;
    }

    @GetMapping("/target/{targetId}")
    public ApiResponse<List<MediaDTO>> getByTarget(
            @PathVariable UUID targetId,
            @RequestParam String targetTypeCode
    ) {
        ApiResponse<List<MediaDTO>> res = new ApiResponse<>();
        res.setResult(mediaService.getByTarget(targetId, targetTypeCode));
        return res;
    }

    @PostMapping("/upload")
    public ApiResponse<MediaDTO> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("targetId") UUID targetId,
            @RequestParam("targetTypeCode") String targetTypeCode
    ) {
        ApiResponse<MediaDTO> res = new ApiResponse<>();
        res.setResult(mediaService.upload(file, targetId, targetTypeCode));
        return res;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        mediaService.delete(id);
        return new ApiResponse<>();
    }

    @DeleteMapping("/target/{targetId}")
    public ApiResponse<Void> deleteAllMediaForTarget(
            @PathVariable UUID targetId,
            @RequestParam String targetTypeCode
    ) {
        mediaService.deleteAllMediaForTarget(targetId, targetTypeCode);
        return new ApiResponse<>();
    }
}
