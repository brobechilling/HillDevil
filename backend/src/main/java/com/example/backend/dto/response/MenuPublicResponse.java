package com.example.backend.dto.response;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class MenuPublicResponse {
    private UUID restaurantId;
    private List<MenuItemDTO> items;

    public MenuPublicResponse() {
    }

    public UUID getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(UUID restaurantId) {
        this.restaurantId = restaurantId;
    }

    public List<MenuItemDTO> getItems() {
        return items;
    }

    public void setItems(List<MenuItemDTO> items) {
        this.items = items;
    }

    public static class MenuItemDTO {
        private UUID id;
        private String name;
        private String description;
        private BigDecimal price;
        private boolean bestSeller;
        private String category;
        private String imageUrl;

        public MenuItemDTO() {
        }

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }

        public boolean isBestSeller() {
            return bestSeller;
        }

        public void setBestSeller(boolean bestSeller) {
            this.bestSeller = bestSeller;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getImageUrl() {
            return imageUrl;
        }
        
        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }
    }
}
