package com.example.backend.websocket;

import com.example.backend.dto.request.MessageRequest;
import com.example.backend.dto.response.MessageResponse;
import com.example.backend.entity.User;  
import com.example.backend.repository.UserRepository;
import com.example.backend.security.UserPrincipal;
import com.example.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketMessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository; 

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageRequest messageRequest, Principal principal) {
        
        try {
            Long senderId = getUserIdFromPrincipal(principal);
            
            log.info("========== WEBSOCKET SEND MESSAGE ==========");
            log.info("Principal name (username): {}", principal.getName());
            log.info("Sender ID: {}", senderId);
            log.info("Recipient ID: {}", messageRequest.getRecipientId());
            log.info("Content: {}", messageRequest.getContent());

            if (senderId == null) {
                log.error("❌ Sender ID is NULL");
                return;
            }

            // Save message to database
            MessageResponse messageResponse = messageService.sendMessage(senderId, messageRequest);

            log.info("✅ Message saved to database with ID: {}", messageResponse.getId());

            // ⭐ Lấy username của sender (đã có sẵn từ principal)
            String senderUsername = principal.getName();
            
            // ⭐ Lấy username của recipient từ database
            User recipient = userRepository.findById(messageRequest.getRecipientId())
                    .orElseThrow(() -> new RuntimeException("Recipient not found"));
            String recipientUsername = recipient.getUsername();
            
            log.info("📤 Sending to sender username: {}", senderUsername);
            messagingTemplate.convertAndSendToUser(
                    senderUsername,
                    "/queue/messages",
                    messageResponse
            );

            log.info("📤 Sending to recipient username: {}", recipientUsername);
            messagingTemplate.convertAndSendToUser(
                    recipientUsername,
                    "/queue/messages",
                    messageResponse
            );

            log.info("✅ Messages sent successfully to both users");
            log.info("===========================================");

        } catch (Exception e) {
            log.error("❌ Error sending message", e);
            e.printStackTrace();
        }
    }

    @MessageMapping("/chat.typing")
    public void sendTypingIndicator(@Payload Long recipientId, Principal principal) {
        try {
            Long senderId = getUserIdFromPrincipal(principal);
            
            log.debug("Principal type: {}", principal.getClass().getName());
            log.debug("Principal name: {}", principal.getName());
            log.debug("Principal object type: {}", principal.getClass().getSimpleName());
            log.debug("WebSocket: User {} is typing to user {}", senderId, recipientId);

            // ⭐ Lấy username của recipient
            User recipient = userRepository.findById(recipientId)
                    .orElseThrow(() -> new RuntimeException("Recipient not found"));
            
            messagingTemplate.convertAndSendToUser(
                    recipient.getUsername(),  // ⭐ Dùng username
                    "/queue/typing",
                    senderId
            );
        } catch (Exception e) {
            log.error("Error sending typing indicator", e);
        }
    }

    private Long getUserIdFromPrincipal(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) principal;
            if (token.getPrincipal() instanceof UserPrincipal) {
                return ((UserPrincipal) token.getPrincipal()).getId();
            }
        }
        return null;
    }
}