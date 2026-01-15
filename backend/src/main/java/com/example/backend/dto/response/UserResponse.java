
package com.example.backend.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class UserResponse {
    
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private Long followersCount;
    private Long followingCount;
    private Long postsCount;
    private Boolean isFollowing;
    private LocalDateTime createdAt;
}