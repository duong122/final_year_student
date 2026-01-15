package com.example.backend.dto.response;

import lombok.*;

/**
 * Response DTO cho Conversation
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TypingIndicatorDto {
    private Long conversationId;
    private boolean isTyping;
}