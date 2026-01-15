// File: src/main/java/com/example/backend/service/ChatbotService.java

package com.example.backend.service;

import com.example.backend.dto.request.ChatbotMessageRequest;
import com.example.backend.dto.response.ChatbotResponse;
import com.example.backend.entity.ChatbotConversation;
import com.example.backend.entity.User;

public interface ChatbotService {

    /**
     * Get or create chatbot conversation for user
     */
    ChatbotConversation getOrCreateChatbotConversation(User user);

    /**
     * Send message to chatbot and get response
     */
    ChatbotResponse sendMessage(User user, ChatbotMessageRequest request);
}