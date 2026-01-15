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
public class SendMessageDto {
    private Long conversationId;
    private String content;
    private String messageType;
}