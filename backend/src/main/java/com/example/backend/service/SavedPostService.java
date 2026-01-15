package com.example.backend.service;

import com.example.backend.dto.response.PostResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service for managing saved posts
 */
public interface SavedPostService {

    /**
     * Save a post (bookmark)
     *
     * @param postId ID of the post to save
     * @param userId ID of the user saving the post
     * @return true if saved successfully, false if already saved
     */
    boolean savePost(Long postId, Long userId);

    /**
     * Unsave a post (remove bookmark)
     *
     * @param postId ID of the post to unsave
     * @param userId ID of the user
     * @return true if unsaved successfully, false if not saved
     */
    boolean unsavePost(Long postId, Long userId);

    /**
     * Check if user has saved a post
     *
     * @param postId ID of the post
     * @param userId ID of the user
     * @return true if saved, false otherwise
     */
    boolean isSaved(Long postId, Long userId);

    /**
     * Get all saved posts for a user
     *
     * @param userId ID of the user
     * @param pageable Pagination info
     * @return Page of saved posts
     */
    Page<PostResponse> getSavedPosts(Long userId, Pageable pageable);

    /**
     * Get count of saved posts for a user
     *
     * @param userId ID of the user
     * @return Count of saved posts
     */
    long getSavedPostsCount(Long userId);
}