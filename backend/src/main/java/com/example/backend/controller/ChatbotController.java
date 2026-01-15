
package com.example.backend.controller;

import com.example.backend.dto.request.ChatbotMessageRequest;
import com.example.backend.dto.response.ChatbotConversationResponse;
import com.example.backend.dto.response.ChatbotResponse;
import com.example.backend.entity.ChatbotConversation;
import com.example.backend.entity.User;
import com.example.backend.security.JwtTokenProvider;
import com.example.backend.service.ChatbotService;
import com.example.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final UserRepository userRepository; // ✅ Đổi từ UserService sang UserRepository
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Get or create chatbot conversation
     * GET /api/chatbot/conversation
     */
    @GetMapping("/conversation")
    public ResponseEntity<ChatbotConversationResponse> getChatbotConversation(
            @RequestHeader("Authorization") String authHeader) {

        try {
            User currentUser = getCurrentUser(authHeader);
            ChatbotConversation chatbotConversation = chatbotService.getOrCreateChatbotConversation(currentUser);

            ChatbotConversationResponse response = ChatbotConversationResponse.builder()
                    .id(chatbotConversation.getId())
                    .userId(currentUser.getId())
                    .conversationId(chatbotConversation.getConversation().getId())
                    .botUsername("linkly_assistant")
                    .botAvatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=linkly")
                    .createdAt(chatbotConversation.getCreatedAt())
                    .updatedAt(chatbotConversation.getUpdatedAt())
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting chatbot conversation: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Send message to chatbot
     * POST /api/chatbot/message
     */
    @PostMapping("/message")
    public ResponseEntity<ChatbotResponse> sendMessage(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ChatbotMessageRequest request) {

        try {
            User currentUser = getCurrentUser(authHeader);
            ChatbotResponse response = chatbotService.sendMessage(currentUser, request);

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (Exception e) {
            log.error("Error sending message to chatbot: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ChatbotResponse.builder()
                            .success(false)
                            .message("Internal server error: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Health check endpoint
     * GET /api/chatbot/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Chatbot service is running");
    }

    /**
     * Helper method to get current user from JWT token
     * ✅ Sửa để dùng getUserIdFromToken thay vì getUsernameFromToken
     */
    private User getCurrentUser(String authHeader) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix

        // ✅ Dùng getUserIdFromToken (method có sẵn trong JwtTokenProvider)
        Long userId = jwtTokenProvider.getUserIdFromToken(token);

        // ✅ Dùng UserRepository thay vì UserService
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}