package com.example.backend.dto.response;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

import com.example.backend.entities.ReservationStatus;

public class ReservationResponse {

    private UUID reservationId;
    private UUID branchId;
    private UUID areaTableId;
    private LocalDateTime startTime;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private int guestNumber;
    private String note;
    private ReservationStatus status;

    public ReservationResponse() {
    }

    public ReservationResponse(UUID reservationId, UUID branchId, UUID areaTableId, LocalDateTime startTime,
            String customerName, String customerPhone, String customerEmail, int guestNumber, String note,
            ReservationStatus status) {
        this.reservationId = reservationId;
        this.branchId = branchId;
        this.areaTableId = areaTableId;
        this.startTime = startTime;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.customerEmail = customerEmail;
        this.guestNumber = guestNumber;
        this.note = note;
        this.status = status;
    }

    public UUID getReservationId() {
        return reservationId;
    }

    public void setReservationId(UUID reservationId) {
        this.reservationId = reservationId;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public UUID getAreaTableId() {
        return areaTableId;
    }

    public void setAreaTableId(UUID areaTableId) {
        this.areaTableId = areaTableId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public int getGuestNumber() {
        return guestNumber;
    }

    public void setGuestNumber(int guestNumber) {
        this.guestNumber = guestNumber;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

}
