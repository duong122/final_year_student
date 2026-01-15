package com.example.backend.repository;

import com.example.backend.entity.SavedPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {

    /**
     * Check if user has saved a post
     */
    boolean existsByUserIdAndPostId(Long userId, Long postId);

    /**
     * Find a specific saved post
     */
    Optional<SavedPost> findByUserIdAndPostId(Long userId, Long postId);

    /**
     * Get all saved posts for a user (paginated)
     */
    Page<SavedPost> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Count saved posts for a user
     */
    long countByUserId(Long userId);

    /**
     * Delete saved post
     */
    void deleteByUserIdAndPostId(Long userId, Long postId);

    /**
     * Get post IDs that user has saved (for checking isSaved status)
     */
    @Query("SELECT sp.postId FROM SavedPost sp WHERE sp.userId = :userId AND sp.postId IN :postIds")
    java.util.List<Long> findSavedPostIdsByUserIdAndPostIdIn(
            @Param("userId") Long userId,
            @Param("postIds") java.util.List<Long> postIds
    );
}