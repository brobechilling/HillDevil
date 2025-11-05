package com.example.backend.dto.response;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class RestaurantPublicResponse {
    private UUID restaurantId;
    private String name;
    private String phone;
    private String email;
    private String description;
    private List<BranchInfo> branches;

    public RestaurantPublicResponse() {
    }

    public UUID getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(UUID restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<BranchInfo> getBranches() {
        return branches;
    }

    public void setBranches(List<BranchInfo> branches) {
        this.branches = branches;
    }

    public static class BranchInfo {
        private UUID branchId;
        private String address;
        private String phone;
        private String email;
        private LocalTime openingTime;
        private LocalTime closingTime;

        public BranchInfo() {
        }

        public UUID getBranchId() {
            return branchId;
        }

        public void setBranchId(UUID branchId) {
            this.branchId = branchId;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
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
    }
}
