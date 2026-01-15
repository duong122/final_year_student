package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotConversationResponse {

    private Long id;
    private Long userId;
    private Long conversationId; // ID của conversation trong conversations table
    private String botUsername; // "linkly_assistant"
    private String botAvatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}