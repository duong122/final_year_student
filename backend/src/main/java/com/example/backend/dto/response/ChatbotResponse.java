package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotResponse {

    private boolean success;
    private String message;
    private ChatbotMessageResponse botMessage; // Response từ bot
    private Long conversationId; // ID để frontend có thể load messages
}