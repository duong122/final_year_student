package com.example.backend.repository;

import com.example.backend.entity.Like;
import com.example.backend.entity.LikeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, LikeId> {

    // ========== EXISTING METHODS (GIỮ NGUYÊN 100%) ==========

    @Query("SELECT l FROM Like l WHERE l.id.userId = :userId AND l.id.postId = :postId")
    Optional<Like> findByUserIdAndPostId(Long userId, Long postId);

    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM Like l WHERE l.id.userId = :userId AND l.id.postId = :postId")
    boolean existsByUserIdAndPostId(Long userId, Long postId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.id.postId = :postId")
    long countByPostId(Long postId);

    @Query("DELETE FROM Like l WHERE l.id.userId = :userId AND l.id.postId = :postId")
    void deleteByUserIdAndPostId(Long userId, Long postId);

    // ========== NEW METHOD (MỚI THÊM - CHỈ 1 METHOD) ==========

    /**
     * Check if user has liked a post (reverse parameter order)
     * Wrapper method for SavedPostService compatibility
     */
    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM Like l WHERE l.id.postId = :postId AND l.id.userId = :userId")
    boolean existsByPostIdAndUserId(Long postId, Long userId);
}