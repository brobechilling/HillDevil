package com.example.backend.dto.response;

import java.util.List;

public class PageResponse<T> {

    private List<T> items;
    private long totalElements;
    private int totalPages;

    public List<T> getItems() {
        return items;
    }
    public void setItems(List<T> items) {
        this.items = items;
    }
    public long getTotalElements() {
        return totalElements;
    }
    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }
    public int getTotalPages() {
        return totalPages;
    }
    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
    
}
