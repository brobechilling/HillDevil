package com.example.backend.dto.request;

import java.util.List;
import java.util.UUID;

public class CreateOrderRequest {
    private UUID areaTableId;
    private List<CreateOrderLineRequest> orderLines;

    public UUID getAreaTableId() {
        return areaTableId;
    }

    public void setAreaTableId(UUID areaTableId) {
        this.areaTableId = areaTableId;
    }

    public List<CreateOrderLineRequest> getOrderLines() {
        return orderLines;
    }

    public void setOrderLines(List<CreateOrderLineRequest> orderLines) {
        this.orderLines = orderLines;
    }
}
