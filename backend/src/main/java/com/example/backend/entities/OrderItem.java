package com.example.backend.entities;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

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
@Table(name = "order_item")
public class OrderItem {

    @Id
    @Column(name = "order_item_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID orderItemId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(nullable = false,name = "order_line_id")
    private OrderLine orderLine;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(nullable = false,name = "menu_item_id")
    private MenuItem menuItem;

    @Column(name = "quantity")
    private int quantity;

    @Column(name = "total_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Column(name = "note")
    private String note;

    // soft delete
    @Column(name = "status")
    private boolean status;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "orderItem", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    private Set<OrderItemCustomization> orderItemCustomizations = new LinkedHashSet<>();

    public UUID getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(UUID orderItemId) {
        this.orderItemId = orderItemId;
    }

    public OrderLine getOrderLine() {
        return orderLine;
    }

    public void setOrderLine(OrderLine orderLine) {
        this.orderLine = orderLine;
    }

    public MenuItem getMenuItem() {
        return menuItem;
    }

    public void setMenuItem(MenuItem menuItem) {
        this.menuItem = menuItem;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public Set<OrderItemCustomization> getOrderItemCustomizations() {
        return orderItemCustomizations;
    }

    public void setOrderItemCustomizations(Set<OrderItemCustomization> orderItemCustomizations) {
        this.orderItemCustomizations = orderItemCustomizations;
    }

}
