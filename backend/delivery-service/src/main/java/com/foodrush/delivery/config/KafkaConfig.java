package com.foodrush.delivery.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.*;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic deliveryEventsTopic() {
        return TopicBuilder.name("delivery.events")
            .partitions(3)
            .replicas(1)
            .build();
    }

    @Bean
    public NewTopic locationUpdatesTopic() {
        return TopicBuilder.name("delivery.location")
            .partitions(3)
            .replicas(1)
            .build();
    }
}
