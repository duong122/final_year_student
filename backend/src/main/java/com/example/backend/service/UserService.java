
package com.example.backend.service;

import com.example.backend.dto.request.PasswordChangeRequest;
import com.example.backend.dto.request.UserUpdateRequest;
import com.example.backend.dto.response.UserResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    
    UserResponse getCurrentUser(Long userId);
    
    UserResponse getUserByUsername(String username, Long currentUserId);
    
    UserResponse getUserById(Long userId, Long currentUserId);
    
    UserResponse updateUser(Long userId, UserUpdateRequest request);
    
    void changePassword(Long userId, PasswordChangeRequest request);
    
    List<UserResponse> searchUsers(String keyword, Long currentUserId);

    /**
     * Upload avatar cho user
     * @param file File ảnh avatar
     * @return URL của avatar mới
     */
    String uploadAvatar(MultipartFile file);

    /**
     * Update user profile với avatar mới
     * @param request UpdateUserRequest
     * @param avatarFile File avatar (optional)
     * @return UserProfileResponse
     */
    UserResponse updateProfile(UserUpdateRequest request, MultipartFile avatarFile);
}