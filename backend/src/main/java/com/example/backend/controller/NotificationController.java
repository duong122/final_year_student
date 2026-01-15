
package com.example.backend.controller;

import com.example.backend.dto.response.NotificationResponse;
import com.example.backend.service.NotificationService;
import com.example.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications - Lấy danh sách notifications
     * Query params: page (default 0), size (default 20)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = getUserIdFromToken(authHeader);

        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> notifications = notificationService.getNotifications(userId, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notifications retrieved successfully");
        response.put("data", Map.of(
                "content", notifications.getContent(),
                "pageNumber", notifications.getNumber(),
                "pageSize", notifications.getSize(),
                "totalElements", notifications.getTotalElements(),
                "totalPages", notifications.getTotalPages(),
                "last", notifications.isLast()
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/notifications/unread-count - Lấy số lượng notifications chưa đọc
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = getUserIdFromToken(authHeader);
        Long unreadCount = notificationService.getUnreadCount(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Unread count retrieved successfully");
        response.put("data", Map.of("unreadCount", unreadCount));

        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/notifications/{id}/read - Đánh dấu một notification là đã đọc
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) {
        Long userId = getUserIdFromToken(authHeader);
        notificationService.markAsRead(id, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notification marked as read");

        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/notifications/read-all - Đánh dấu tất cả notifications là đã đọc
     */
    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = getUserIdFromToken(authHeader);
        int updatedCount = notificationService.markAllAsRead(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "All notifications marked as read");
        response.put("data", Map.of("updatedCount", updatedCount));

        return ResponseEntity.ok(response);
    }

    /**
     * Utility method để lấy userId từ JWT token
     */
    private Long getUserIdFromToken(String authHeader) {
        return SecurityUtil.getCurrentUserId();
    }
}