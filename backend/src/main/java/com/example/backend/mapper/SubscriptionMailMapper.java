package com.example.backend.mapper;
import com.example.backend.entities.Subscription;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import com.example.backend.dto.request.SubscriptionReminderMailRequest;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface SubscriptionMailMapper {

    @Mapping(source = "restaurant.user.email", target = "mail")
    @Mapping(source = "restaurant.user.username", target = "name")
    @Mapping(source = "aPackage.name", target = "packageName")
    @Mapping(source = "endDate", target = "endDate", dateFormat = "yyyy-MM-dd")
    @Mapping(source = "subscriptionId", target = "renewLink", qualifiedByName = "generateRenewLink")
    SubscriptionReminderMailRequest toReminderMailRequest(Subscription subscription);

    @Named("generateRenewLink")
    default String generateRenewLink(UUID subscriptionId) {
        return "https://your-frontend-url.com/renew/" + subscriptionId;
    }
}
