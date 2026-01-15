
package com.example.backend.service.impl;

import com.example.backend.dto.response.NotificationResponse;
import com.example.backend.entity.Notification;
import com.example.backend.entity.Post;
import com.example.backend.entity.User;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    /**
     * Lấy danh sách notifications của user
     */
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, pageable);

        return notifications.map(this::convertToResponse);
    }

    /**
     * Lấy số lượng notifications chưa đọc
     */
    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadNotifications(userId);
    }

    /**
     * Đánh dấu một notification là đã đọc
     */
    @Override
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        int updated = notificationRepository.markAsRead(notificationId, userId);
        if (updated == 0) {
            throw new RuntimeException("Notification not found or not belongs to user");
        }
    }

    /**
     * Đánh dấu tất cả notifications là đã đọc
     */
    @Override
    @Transactional
    public int markAllAsRead(Long userId) {
        return notificationRepository.markAllAsRead(userId);
    }

    /**
     * Tạo notification khi có người like post
     */
    @Override
    @Transactional
    public void createLikeNotification(Long postId, Long likerId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Long postOwnerId = post.getUser().getId();

        // Không tạo notification nếu user like post của chính mình
        if (postOwnerId.equals(likerId)) {
            log.debug("User {} liked their own post, skipping notification", likerId);
            return;
        }

        // Kiểm tra xem đã có notification tương tự trong 1 phút qua chưa (tránh spam)
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        boolean exists = notificationRepository.existsSimilarNotification(
                postOwnerId, likerId, Notification.NotificationType.LIKE_POST, postId, oneMinuteAgo
        );

        if (exists) {
            log.debug("Similar LIKE notification already exists within 1 minute, skipping...");
            return;
        }

        Notification notification = new Notification();
        notification.setRecipientId(postOwnerId);
        notification.setSenderId(likerId);
        notification.setType(Notification.NotificationType.LIKE_POST);
        notification.setPostId(postId);
        notification.setIsRead(false);

        notificationRepository.save(notification);
        log.info("Created LIKE_POST notification: postId={}, postOwner={}, liker={}",
                postId, postOwnerId, likerId);
    }

    /**
     * Tạo notification khi có người comment trên post
     */
    @Override
    @Transactional
    public void createCommentNotification(Long postId, Long commenterId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Long postOwnerId = post.getUser().getId();

        // Không tạo notification nếu user comment trên post của chính mình
        if (postOwnerId.equals(commenterId)) {
            log.debug("User {} commented on their own post, skipping notification", commenterId);
            return;
        }

        // Kiểm tra duplicate
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        boolean exists = notificationRepository.existsSimilarNotification(
                postOwnerId, commenterId, Notification.NotificationType.COMMENT_ON_POST, postId, oneMinuteAgo
        );

        if (exists) {
            log.debug("Similar COMMENT notification already exists within 1 minute, skipping...");
            return;
        }

        Notification notification = new Notification();
        notification.setRecipientId(postOwnerId);
        notification.setSenderId(commenterId);
        notification.setType(Notification.NotificationType.COMMENT_ON_POST);
        notification.setPostId(postId);
        notification.setIsRead(false);

        notificationRepository.save(notification);
        log.info("Created COMMENT_ON_POST notification: postId={}, postOwner={}, commenter={}",
                postId, postOwnerId, commenterId);
    }

    /**
     * Tạo notification khi có người follow
     */
    @Override
    @Transactional
    public void createFollowNotification(Long followedUserId, Long followerId) {
        // Không tạo notification nếu user follow chính mình (edge case)
        if (followedUserId.equals(followerId)) {
            log.debug("User {} tried to follow themselves, skipping notification", followerId);
            return;
        }

        // Kiểm tra duplicate
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        boolean exists = notificationRepository.existsSimilarNotification(
                followedUserId, followerId, Notification.NotificationType.NEW_FOLLOWER, null, oneMinuteAgo
        );

        if (exists) {
            log.debug("Similar FOLLOW notification already exists within 1 minute, skipping...");
            return;
        }

        Notification notification = new Notification();
        notification.setRecipientId(followedUserId);
        notification.setSenderId(followerId);
        notification.setType(Notification.NotificationType.NEW_FOLLOWER);
        notification.setPostId(null); // Follow notification không có postId
        notification.setIsRead(false);

        notificationRepository.save(notification);
        log.info("Created NEW_FOLLOWER notification: followedUser={}, follower={}",
                followedUserId, followerId);
    }

    /**
     * Xóa notification khi unlike post
     */
    @Override
    @Transactional
    public void deleteLikeNotification(Long postId, Long likerId) {
        // Optional: Implement nếu muốn xóa notification khi unlike
        // Có thể bỏ qua nếu muốn giữ history
        log.debug("deleteLikeNotification called but not implemented - keeping notification history");
    }

    /**
     * Convert Notification entity sang NotificationResponse DTO
     */
    private NotificationResponse convertToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setRecipientId(notification.getRecipientId());
        response.setSenderId(notification.getSenderId());
        response.setType(notification.getType());
        response.setPostId(notification.getPostId());
        response.setIsRead(notification.getIsRead());
        response.setCreatedAt(notification.getCreatedAt());

        // Lấy thông tin sender
        userRepository.findById(notification.getSenderId()).ifPresent(sender -> {
            response.setSenderUsername(sender.getUsername());
            response.setSenderFullName(sender.getFullName());
            response.setSenderAvatarUrl(sender.getAvatarUrl());
        });

        // Lấy thông tin post (nếu có)
        if (notification.getPostId() != null) {
            postRepository.findById(notification.getPostId()).ifPresent(post -> {
                response.setPostImageUrl(post.getImageUrl());
            });
        }

        // Tạo human-readable message
        response.setMessage(generateNotificationMessage(notification, response.getSenderUsername()));

        return response;
    }

    /**
     * Tạo message text cho notification
     */
    private String generateNotificationMessage(Notification notification, String senderUsername) {
        if (senderUsername == null) {
            senderUsername = "Ai đó";
        }

        switch (notification.getType()) {
            case LIKE_POST:
                return senderUsername + " đã thích bài viết của bạn";
            case COMMENT_ON_POST:
                return senderUsername + " đã bình luận về bài viết của bạn";
            case NEW_FOLLOWER:
                return senderUsername + " đã bắt đầu theo dõi bạn";
            default:
                return "Bạn có một thông báo mới";
        }
    }
}