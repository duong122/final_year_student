
package com.example.backend.service;

import com.example.backend.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Interface for Notification Service
 */
public interface NotificationService {

    /**
     * Lấy danh sách notifications của user với phân trang
     *
     * @param userId ID của user
     * @param pageable Thông tin phân trang
     * @return Page của NotificationResponse
     */
    Page<NotificationResponse> getNotifications(Long userId, Pageable pageable);

    /**
     * Lấy số lượng notifications chưa đọc
     *
     * @param userId ID của user
     * @return Số lượng notifications chưa đọc
     */
    Long getUnreadCount(Long userId);

    /**
     * Đánh dấu một notification là đã đọc
     *
     * @param notificationId ID của notification
     * @param userId ID của user (để verify quyền)
     */
    void markAsRead(Long notificationId, Long userId);

    /**
     * Đánh dấu tất cả notifications của user là đã đọc
     *
     * @param userId ID của user
     * @return Số lượng notifications đã được cập nhật
     */
    int markAllAsRead(Long userId);

    /**
     * Tạo notification khi có người like post
     *
     * @param postId ID của post được like
     * @param likerId ID của user đã like
     */
    void createLikeNotification(Long postId, Long likerId);

    /**
     * Tạo notification khi có người comment trên post
     *
     * @param postId ID của post
     * @param commenterId ID của user đã comment
     */
    void createCommentNotification(Long postId, Long commenterId);

    /**
     * Tạo notification khi có người follow
     *
     * @param followedUserId ID của user được follow
     * @param followerId ID của user đã follow
     */
    void createFollowNotification(Long followedUserId, Long followerId);

    /**
     * Xóa notification khi unlike post (optional)
     *
     * @param postId ID của post
     * @param likerId ID của user đã unlike
     */
    void deleteLikeNotification(Long postId, Long likerId);
}