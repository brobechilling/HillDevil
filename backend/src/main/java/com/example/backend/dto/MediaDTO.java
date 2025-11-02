package com.example.backend.dto;

import java.util.UUID;

public class MediaDTO {
    private UUID mediaId;
    private UUID targetId;
    private String targetTypeCode;
    private String url;
    private boolean status;

    // getter & setter
    public UUID getMediaId() { return mediaId; }
    public void setMediaId(UUID mediaId) { this.mediaId = mediaId; }

    public UUID getTargetId() { return targetId; }
    public void setTargetId(UUID targetId) { this.targetId = targetId; }

    public String getTargetTypeCode() { return targetTypeCode; }
    public void setTargetTypeCode(String targetTypeCode) { this.targetTypeCode = targetTypeCode; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public boolean isStatus() { return status; }
    public void setStatus(boolean status) { this.status = status; }
}
