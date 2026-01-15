
package com.example.backend.listener;

import com.example.backend.event.NewCommentEvent;
import com.example.backend.event.NewFollowerEvent;
import com.example.backend.event.NewLikeEvent;
import com.example.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Listener để tự động tạo notifications khi có các event xảy ra
 * Sử dụng Spring Event để decouple notification logic khỏi business logic
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;

    /**
     * Lắng nghe event khi có người like post
     */
    @EventListener
    @Async
    public void handleLikeEvent(NewLikeEvent event) {
        try {
            log.info("Received LikeEvent: postId={}, likerId={}", event.getPostId(), event.getLikerId());
            notificationService.createLikeNotification(event.getPostId(), event.getLikerId());
        } catch (Exception e) {
            log.error("Error creating like notification", e);
        }
    }

    /**
     * Lắng nghe event khi có người comment
     */
    @EventListener
    @Async
    public void handleCommentEvent(NewCommentEvent event) {
        try {
            log.info("Received CommentCreatedEvent: postId={}, commenterId={}", event.getPostId(), event.getCommenterId());
            notificationService.createCommentNotification(event.getPostId(), event.getCommenterId());
        } catch (Exception e) {
            log.error("Error creating comment notification", e);
        }
    }

    /**
     * Lắng nghe event khi có người follow
     * ✅ Đã update để dùng NewFollowerEvent có sẵn
     */
    @EventListener
    @Async
    public void handleNewFollowerEvent(NewFollowerEvent event) {
        try {
            log.info("Received NewFollowerEvent: followerId={}, followingId={}",
                    event.getFollowerId(), event.getFollowingId());

            // followingId = người được follow (recipient)
            // followerId = người đang follow (sender)
            notificationService.createFollowNotification(event.getFollowingId(), event.getFollowerId());
        } catch (Exception e) {
            log.error("Error creating follow notification", e);
        }
    }
}