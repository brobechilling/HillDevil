package com.example.backend.dto.response;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class QrCodeJsonResponse {
    private UUID tableId;
    private String tableTag;
    private String qrCodeBase64;
    private String orderUrl;
    private int size;

    public UUID getTableId() { 
        return tableId; 
    }
    
    public void setTableId(UUID tableId) { 
        this.tableId = tableId; 
    }
    
    public String getTableTag() { 
        return tableTag; 
    }
    
    public void setTableTag(String tableTag) { 
        this.tableTag = tableTag; 
    }
    
    public String getQrCodeBase64() { 
        return qrCodeBase64; 
    }
    
    public void setQrCodeBase64(String qrCodeBase64) { 
        this.qrCodeBase64 = qrCodeBase64; 
    }
    
    public String getOrderUrl() { 
        return orderUrl; 
    }
    
    public void setOrderUrl(String orderUrl) { 
        this.orderUrl = orderUrl; 
    }
    
    public int getSize() { 
        return size; 
    }
    
    public void setSize(int size) { 
        this.size = size; 
    }
}

