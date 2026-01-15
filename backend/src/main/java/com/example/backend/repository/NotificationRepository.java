
package com.example.backend.repository;

import com.example.backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Lấy danh sách notifications của user với phân trang
     */
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    /**
     * Lấy số lượng notifications chưa đọc
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientId = :recipientId AND n.isRead = false")
    Long countUnreadNotifications(@Param("recipientId") Long recipientId);

    /**
     * Đánh dấu tất cả notifications của user là đã đọc
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipientId = :recipientId AND n.isRead = false")
    int markAllAsRead(@Param("recipientId") Long recipientId);

    /**
     * Đánh dấu một notification cụ thể là đã đọc
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :notificationId AND n.recipientId = :recipientId")
    int markAsRead(@Param("notificationId") Long notificationId, @Param("recipientId") Long recipientId);

    /**
     * Xóa notification cũ (optional - để cleanup)
     */
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipientId = :recipientId AND n.createdAt < :beforeDate")
    int deleteOldNotifications(@Param("recipientId") Long recipientId, @Param("beforeDate") java.time.LocalDateTime beforeDate);

    /**
     * Kiểm tra xem đã có notification tương tự chưa (để tránh duplicate)
     */
    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.recipientId = :recipientId " +
            "AND n.senderId = :senderId AND n.type = :type AND n.postId = :postId " +
            "AND n.createdAt > :sinceTime")
    boolean existsSimilarNotification(
            @Param("recipientId") Long recipientId,
            @Param("senderId") Long senderId,
            @Param("type") Notification.NotificationType type,
            @Param("postId") Long postId,
            @Param("sinceTime") java.time.LocalDateTime sinceTime
    );
}