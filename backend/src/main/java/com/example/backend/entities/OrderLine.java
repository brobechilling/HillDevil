package com.example.backend.entities;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "order_line")
public class OrderLine {

    @Id
    @Column(name = "order_line_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID orderLineId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(nullable = false,name = "order_id")
    private Order order;

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "orderLine", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrderItem> orderItems = new LinkedHashSet<>();

    @Column(name = "total_price", precision = 10, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_line_status")
    private OrderLineStatus orderLineStatus;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public UUID getOrderLineId() {
        return orderLineId;
    }

    public void setOrderLineId(UUID orderLineId) {
        this.orderLineId = orderLineId;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Set<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(Set<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    public OrderLineStatus getOrderLineStatus() {
        return orderLineStatus;
    }

    public void setOrderLineStatus(OrderLineStatus orderLineStatus) {
        this.orderLineStatus = orderLineStatus;
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

    public BigDecimal getTotalPrice() {return totalPrice;}

    public void setTotalPrice(BigDecimal totalPrice) {this.totalPrice = totalPrice;}

}
