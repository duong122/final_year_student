package com.example.backend.service.impl;

import com.example.backend.dto.request.PasswordChangeRequest;
import com.example.backend.dto.request.UserUpdateRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.FileUploadService;
import com.example.backend.service.UserService;
import com.example.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final FileUploadService fileUploadService;
    
    @Override
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toUserResponse(user, userId);
    }
    
    @Override
    public UserResponse getUserByUsername(String username, Long currentUserId) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
        return userMapper.toUserResponse(user, currentUserId);
    }
    
    @Override
    public UserResponse getUserById(Long userId, Long currentUserId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        return userMapper.toUserResponse(user, currentUserId);
    }
    
    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        
        User updatedUser = userRepository.save(user);
        return userMapper.toUserResponse(updatedUser, userId);
    }
    
    @Override
    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    
    @Override
    public List<UserResponse> searchUsers(String keyword, Long currentUserId) {
        List<User> users = userRepository.findAll().stream()
            .filter(user -> 
                user.getUsername().toLowerCase().contains(keyword.toLowerCase()) ||
                (user.getFullName() != null && user.getFullName().toLowerCase().contains(keyword.toLowerCase()))
            )
            .limit(20)
            .collect(Collectors.toList());
        
        return users.stream()
            .map(user -> userMapper.toUserResponse(user, currentUserId))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String uploadAvatar(MultipartFile file) {
        // Upload lên Cloudinary vào folder "linkly/avatars"
        return fileUploadService.uploadFile(file, "linkly/avatars");
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UserUpdateRequest request, MultipartFile avatarFile) {
        // Lấy user hiện tại
        Long currentUserId = SecurityUtil.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        // Lưu avatar URL cũ để xóa sau
        String oldAvatarUrl = user.getAvatarUrl();

        // Update thông tin cơ bản
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }

        // Nếu có upload avatar mới
        if (avatarFile != null && !avatarFile.isEmpty()) {
            // Upload avatar mới lên Cloudinary
            String newAvatarUrl = uploadAvatar(avatarFile);
            user.setAvatarUrl(newAvatarUrl);

            // Xóa avatar cũ từ Cloudinary
            if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty()) {
                fileUploadService.deleteFile(oldAvatarUrl);
            }
        } else if (request.getAvatarUrl() != null) {
            // Nếu không upload file nhưng có URL trong request (trường hợp giữ nguyên hoặc dùng URL)
            user.setAvatarUrl(request.getAvatarUrl());
        }

        // Lưu vào database
        User updatedUser = userRepository.save(user);

        // Convert sang Response
        return UserResponse.builder()
                .id(updatedUser.getId())
                .username(updatedUser.getUsername())
                .email(updatedUser.getEmail())
                .fullName(updatedUser.getFullName())
                .avatarUrl(updatedUser.getAvatarUrl())
                .bio(updatedUser.getBio())
                .isFollowing(false)
                .createdAt(updatedUser.getCreatedAt())
                .build();
    }
}