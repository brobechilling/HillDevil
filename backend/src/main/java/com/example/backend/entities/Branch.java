package com.example.backend.entities;

import java.time.Instant;
import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "branch")
public class Branch {
    
    @Id
    @Column(name = "branch_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID branchId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(nullable = false, name = "restaurant_id")
    private Restaurant restaurant;

    @Column(name = "address", nullable = false, unique = true)
    private String address;

    @Column(name = "branch_phone")
    private String branchPhone;

    @Column(name = "opening_time", nullable = false)
    private LocalTime openingTime;
    
    @Column(name = "closing_time",  nullable = false)
    private LocalTime closingTime;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "is_active")
    private boolean isActive;

    @Column(name = "mail", nullable = false, unique = true)
    private String mail;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "branch")
    private Set<StaffAccount> staffAccounts = new LinkedHashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "branch")
    private Set<Area> areas = new LinkedHashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "branch")
    private Set<Reservation> reservations = new LinkedHashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "branch")
    private Set<Bill> bills = new LinkedHashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "branch")
    private Set<BranchMenuItem> branchMenuItems = new LinkedHashSet<>();

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "branch")
    private Set<BranchReport> branchReports = new LinkedHashSet<>();

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public Restaurant getRestaurant() {
        return restaurant;
    }

    public void setRestaurant(Restaurant restaurant) {
        this.restaurant = restaurant;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBranchPhone() {
        return branchPhone;
    }

    public void setBranchPhone(String branchPhone) {
        this.branchPhone = branchPhone;
    }

    public LocalTime getOpeningTime() {
        return openingTime;
    }

    public void setOpeningTime(LocalTime openingTime) {
        this.openingTime = openingTime;
    }

    public LocalTime getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(LocalTime closingTime) {
        this.closingTime = closingTime;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }

    public String getMail() {
        return mail;
    }

    public void setMail(String mail) {
        this.mail = mail;
    }

    public Set<StaffAccount> getStaffAccounts() {
        return staffAccounts;
    }

    public void setStaffAccounts(Set<StaffAccount> staffAccounts) {
        this.staffAccounts = staffAccounts;
    }

    public Set<Area> getAreas() {
        return areas;
    }

    public void setAreas(Set<Area> areas) {
        this.areas = areas;
    }

    public Set<Reservation> getReservations() {
        return reservations;
    }

    public void setReservations(Set<Reservation> reservations) {
        this.reservations = reservations;
    }

    public Set<Bill> getBills() {
        return bills;
    }

    public void setBills(Set<Bill> bills) {
        this.bills = bills;
    }

    public Set<BranchMenuItem> getBranchMenuItems() {
        return branchMenuItems;
    }

    public void setBranchMenuItems(Set<BranchMenuItem> branchMenuItems) {
        this.branchMenuItems = branchMenuItems;
    }

    public Set<BranchReport> getBranchReports() {
        return branchReports;
    }

    public void setBranchReports(Set<BranchReport> branchReports) {
        this.branchReports = branchReports;
    }


}
