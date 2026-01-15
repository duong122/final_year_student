package com.example.backend.service.impl;

import com.example.backend.dto.response.PostResponse;
import com.example.backend.entity.Post;
import com.example.backend.entity.SavedPost;
import com.example.backend.repository.LikeRepository;
import com.example.backend.repository.CommentRepository;
import com.example.backend.repository.PostRepository;
import com.example.backend.repository.SavedPostRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.SavedPostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavedPostServiceImpl implements SavedPostService {

    private final SavedPostRepository savedPostRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    @Override
    @Transactional
    public boolean savePost(Long postId, Long userId) {
        // Check if post exists
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        // ✅ Check if user is trying to save their own post
        if (post.getUser().getId().equals(userId)) {
            log.warn("User {} tried to save their own post {}", userId, postId);
            throw new RuntimeException("You cannot save your own post");
        }

        // Check if already saved
        if (savedPostRepository.existsByUserIdAndPostId(userId, postId)) {
            log.debug("Post {} already saved by user {}", postId, userId);
            return false;
        }

        // Save post
        SavedPost savedPost = new SavedPost();
        savedPost.setUserId(userId);
        savedPost.setPostId(postId);

        savedPostRepository.save(savedPost);
        log.info("User {} saved post {}", userId, postId);

        return true;
    }

    @Override
    @Transactional
    public boolean unsavePost(Long postId, Long userId) {
        // Check if saved
        if (!savedPostRepository.existsByUserIdAndPostId(userId, postId)) {
            log.debug("Post {} not saved by user {}", postId, userId);
            return false;
        }

        // Unsave post
        savedPostRepository.deleteByUserIdAndPostId(userId, postId);
        log.info("User {} unsaved post {}", userId, postId);

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSaved(Long postId, Long userId) {
        return savedPostRepository.existsByUserIdAndPostId(userId, postId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PostResponse> getSavedPosts(Long userId, Pageable pageable) {
        Page<SavedPost> savedPosts = savedPostRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return savedPosts.map(savedPost -> {
            Post post = postRepository.findById(savedPost.getPostId())
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            return convertToPostResponse(post, userId);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public long getSavedPostsCount(Long userId) {
        return savedPostRepository.countByUserId(userId);
    }

    /**
     * Convert Post entity to PostResponse DTO with FULL data
     */
    private PostResponse convertToPostResponse(Post post, Long currentUserId) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setUserId(post.getUser().getId());
        response.setCaption(post.getCaption());
        response.setImageUrl(post.getImageUrl());
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());

        // ✅ Get user info
        userRepository.findById(post.getUser().getId()).ifPresent(user -> {
            response.setUsername(user.getUsername());
            response.setUserFullName(user.getFullName());
            response.setUserAvatarUrl(user.getAvatarUrl());
        });

        // ✅ Get like count (dùng method có sẵn: countByPostId trả về long)
        long likeCount = likeRepository.countByPostId(post.getId());
        response.setLikeCount((Long) likeCount);

        // ✅ Check if current user liked this post (dùng method CÓ SẴN với đúng thứ tự params)
        boolean isLiked = likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
        response.setIsLikedByCurrentUser(isLiked);

        // ✅ Get comment count (dùng method có sẵn: countByPostId trả về long)
        long commentCount = commentRepository.countByPostId(post.getId());
        response.setCommentCount((Long) commentCount);

        log.debug("✅ Populated post {} - likes: {}, isLiked: {}, comments: {}",
                post.getId(), likeCount, isLiked, commentCount);

        return response;
    }
}