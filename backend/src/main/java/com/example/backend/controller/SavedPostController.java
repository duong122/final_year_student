package com.example.backend.controller;

import com.example.backend.dto.response.PostResponse;
import com.example.backend.service.SavedPostService;
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
@RequestMapping("/api/saved-posts")
@RequiredArgsConstructor
public class SavedPostController {

    private final SavedPostService savedPostService;

    /**
     * POST /api/saved-posts/{postId} - Save a post
     */
    @PostMapping("/{postId}")
    public ResponseEntity<Map<String, Object>> savePost(
            @PathVariable Long postId,
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = getUserIdFromToken(authHeader);

        try {
            boolean saved = savedPostService.savePost(postId, userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", saved ? "Post saved successfully" : "Post already saved");
            response.put("data", Map.of("isSaved", true));

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // Handle validation errors (own post, not found, etc.)
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * DELETE /api/saved-posts/{postId} - Unsave a post
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<Map<String, Object>> unsavePost(
            @PathVariable Long postId,
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = getUserIdFromToken(authHeader);

        boolean unsaved = savedPostService.unsavePost(postId, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", unsaved ? "Post unsaved successfully" : "Post was not saved");
        response.put("data", Map.of("isSaved", false));

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/saved-posts/{postId}/status - Check if post is saved
     */
    @GetMapping("/{postId}/status")
    public ResponseEntity<Map<String, Object>> checkSavedStatus(
            @PathVariable Long postId,
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = getUserIdFromToken(authHeader);

        boolean isSaved = savedPostService.isSaved(postId, userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Saved status retrieved");
        response.put("data", Map.of("isSaved", isSaved));

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/saved-posts - Get all saved posts for current user
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getSavedPosts(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = getUserIdFromToken(authHeader);

        Pageable pageable = PageRequest.of(page, size);
        Page<PostResponse> savedPosts = savedPostService.getSavedPosts(userId, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Saved posts retrieved successfully");
        response.put("data", Map.of(
                "content", savedPosts.getContent(),
                "pageNumber", savedPosts.getNumber(),
                "pageSize", savedPosts.getSize(),
                "totalElements", savedPosts.getTotalElements(),
                "totalPages", savedPosts.getTotalPages(),
                "last", savedPosts.isLast()
        ));

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/saved-posts/count - Get count of saved posts
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getSavedPostsCount(
            @RequestHeader("Authorization") String authHeader
    ) {
        Long userId = getUserIdFromToken(authHeader);

        long count = savedPostService.getSavedPostsCount(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Saved posts count retrieved");
        response.put("data", Map.of("count", count));

        return ResponseEntity.ok(response);
    }

    /**
     * Utility method để lấy userId từ JWT token
     */
    private Long getUserIdFromToken(String authHeader) {
        return SecurityUtil.getCurrentUserId();
    }
}