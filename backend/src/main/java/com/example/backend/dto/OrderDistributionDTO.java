package com.example.backend.dto;

public class OrderDistributionDTO {
    private int hour;
    private long orderCount;

    public OrderDistributionDTO() {
    }

    public OrderDistributionDTO(int hour, long orderCount) {
        this.hour = hour;
        this.orderCount = orderCount;
    }

    public int getHour() {
        return hour;
    }

    public void setHour(int hour) {
        this.hour = hour;
    }

    public long getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(long orderCount) {
        this.orderCount = orderCount;
    }
}
