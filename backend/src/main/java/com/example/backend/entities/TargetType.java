package com.example.backend.entities;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "target_type")
public class TargetType {

    @Id
    @Column(name = "target_type_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID targetTypeId;

    @Column(name = "code")
    private String code;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "targetType")
    private Set<Media> medias = new LinkedHashSet<>();

    public UUID getTargetTypeId() {
        return targetTypeId;
    }

    public void setTargetTypeId(UUID targetTypeId) {
        this.targetTypeId = targetTypeId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Set<Media> getMedias() {
        return medias;
    }

    public void setMedias(Set<Media> medias) {
        this.medias = medias;
    }


}
