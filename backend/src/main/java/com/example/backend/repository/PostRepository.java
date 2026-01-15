package com.example.backend.repository;

import com.example.backend.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // Lấy tất cả bài post của một user
    @Query("SELECT p FROM Post p JOIN FETCH p.user WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    Page<Post> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);

    // Lấy feed - bài post của chính user (tạm thời chỉ lấy post của user, chưa include following)
    // Sẽ update sau khi có Follow feature
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    Page<Post> findFeedPosts(@Param("userId") Long userId, Pageable pageable);
    
    // Đếm số post của user
    Long countByUserId(Long userId);
    
    // Tìm bài post theo caption
    @Query("SELECT p FROM Post p WHERE LOWER(p.caption) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY p.createdAt DESC")
    Page<Post> searchByCaption(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Lấy posts từ những người mà user đang follow
     * Sắp xếp theo created_at giảm dần
     */
    @Query("SELECT p FROM Post p " +
            "WHERE p.user.id IN " +
            "(SELECT f.following.id FROM Follower f WHERE f.follower.id = :userId) " +
            "ORDER BY p.createdAt DESC")
    Page<Post> findFollowingPosts(@Param("userId") Long userId, Pageable pageable);
}