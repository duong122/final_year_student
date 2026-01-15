
package com.example.backend.dto.response;

import com.example.backend.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long recipientId;
    private Long senderId;
    private String senderUsername;
    private String senderFullName;
    private String senderAvatarUrl;
    private Notification.NotificationType type;
    private Long postId;
    private String postImageUrl; // Thumbnail của post (nếu có)
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String message; // Human-readable message
}