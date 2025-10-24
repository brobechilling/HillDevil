package com.example.backend.entities;

/**
 * Enum cho trạng thái bàn trong hệ thống
 * Lưu dưới dạng STRING trong database
 * 
 * Các giá trị:
 * - FREE: Bàn đang trống, sẵn sàng phục vụ
 * - OCCUPIED: Bàn đang có khách
 * - ACTIVE: Bàn đang hoạt động
 * - INACTIVE: Bàn không khả dụng
 */
public enum TableStatus {
    FREE,
    OCCUPIED,
    ACTIVE,
    INACTIVE;

    /**
     * Kiểm tra xem trạng thái có hợp lệ không
     */
    public static boolean isValid(String status) {
        if (status == null || status.isBlank()) {
            return false;
        }
        try {
            valueOf(status.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}