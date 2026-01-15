
package com.example.backend.controller;

import com.example.backend.dto.request.PasswordChangeRequest;
import com.example.backend.dto.request.UserUpdateRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.security.UserPrincipal;
import com.example.backend.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private final ObjectMapper objectMapper;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse response = userService.getCurrentUser(currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(
            @PathVariable String username,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse response = userService.getUserByUsername(username, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse response = userService.getUserById(userId, currentUser.getId());
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @Valid @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse response = userService.updateUser(currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse> changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<UserResponse>> searchUsers(
            @RequestParam String keyword,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<UserResponse> users = userService.searchUsers(keyword, currentUser.getId());
        return ResponseEntity.ok(users);
    }

    /**
     * Update user profile với avatar upload
     * Endpoint nhận multipart/form-data
     */
    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> updateProfile(
            @RequestPart(value = "user") String userJson,
            @RequestPart(value = "avatar", required = false) MultipartFile avatarFile
    ) {
        try {
            // Parse JSON string thành UpdateUserRequest
            UserUpdateRequest request = objectMapper.readValue(userJson, UserUpdateRequest.class);

            log.info("Updating profile for current user with data: {}", request);
            if (avatarFile != null) {
                log.info("Avatar file received: {} - Size: {} bytes",
                        avatarFile.getOriginalFilename(),
                        avatarFile.getSize());
            }

            UserResponse response = userService.updateProfile(request, avatarFile);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating profile", e);
            throw new RuntimeException("Failed to update profile: " + e.getMessage());
        }
    }
}