package com.example.backend.entities;

import java.time.Instant;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "invalid_jwt_token")
public class InvalidJwtToken {

    @Id
    private String id;
    @Column(name = "expiration_time")
    private Instant expirationTime;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Instant getExpirationTime() {
        return expirationTime;
    }
    
    public void setExpirationTime(Instant expirationTime) {
        this.expirationTime = expirationTime;
    }

}
