package com.example.backend.dto.response;

import java.util.UUID;
import com.example.backend.entities.TableStatus;

public class TableResponse {
    private UUID id;
    private String tag;
    private int capacity;
    private TableStatus status;
    private String reservedBy; // null nếu không có reservation đang RESERVED

    public TableResponse(UUID id, String tag, int capacity, TableStatus status, String reservedBy) {
        this.id = id;
        this.tag = tag;
        this.capacity = capacity;
        this.status = status;
        this.reservedBy = reservedBy;
    }

    public UUID getId() { return id; }
    public String getTag() { return tag; }
    public int getCapacity() { return capacity; }
    public TableStatus getStatus() { return status; }
    public String getReservedBy() { return reservedBy; }
}
