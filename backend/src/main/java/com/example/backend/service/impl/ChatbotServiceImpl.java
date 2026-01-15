
package com.example.backend.service.impl;

import com.example.backend.dto.request.ChatbotMessageRequest;
import com.example.backend.dto.response.ChatbotMessageResponse;
import com.example.backend.dto.response.ChatbotResponse;
import com.example.backend.entity.*;
import com.example.backend.event.MessageEvent;
import com.example.backend.repository.*;
import com.example.backend.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotServiceImpl implements ChatbotService {

    private final ChatbotConversationRepository chatbotConversationRepository;
    private final ChatbotMessageRepository chatbotMessageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository participantRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final ApplicationEventPublisher eventPublisher;

    private static final Long BOT_USER_ID = 1L; // ID của bot user
    private static final int CONTEXT_HISTORY_LIMIT = 10; // Số messages gần nhất để gửi làm context

    /**
     * Khởi tạo chatbot conversation cho user
     */
    @Override
    @Transactional
    public ChatbotConversation getOrCreateChatbotConversation(User user) {
        // Check if user already has chatbot conversation
        return chatbotConversationRepository.findByUser(user)
                .orElseGet(() -> createNewChatbotConversation(user));
    }

    /**
     * Tạo conversation mới giữa user và bot
     */
    private ChatbotConversation createNewChatbotConversation(User user) {
        // Get bot user
        User botUser = userRepository.findById(BOT_USER_ID)
                .orElseThrow(() -> new RuntimeException("Bot user not found"));

        // Create conversation
        Conversation conversation = Conversation.builder()
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        conversation = conversationRepository.save(conversation);

        // Add participants (user + bot)
        ConversationParticipant userParticipant = ConversationParticipant.builder()
                .user(user)
                .conversation(conversation)
                .joinedAt(LocalDateTime.now())
                .build();
        participantRepository.save(userParticipant);

        ConversationParticipant botParticipant = ConversationParticipant.builder()
                .user(botUser)
                .conversation(conversation)
                .joinedAt(LocalDateTime.now())
                .build();
        participantRepository.save(botParticipant);

        // Create chatbot conversation record
        ChatbotConversation chatbotConversation = ChatbotConversation.builder()
                .user(user)
                .conversation(conversation)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        chatbotConversation = chatbotConversationRepository.save(chatbotConversation);

        // Send welcome message
        sendWelcomeMessage(chatbotConversation, botUser);

        return chatbotConversation;
    }

    /**
     * Gửi welcome message khi user mở chat lần đầu
     */
    private void sendWelcomeMessage(ChatbotConversation chatbotConversation, User botUser) {
        String welcomeText = "Hi there! 👋 I'm Linkly Assistant, your friendly helper.\n\n" +
                "I can help you with:\n" +
                "• Understanding Linkly features\n" +
                "• Creating engaging captions\n" +
                "• Finding hashtags\n" +
                "• Answering your questions\n\n" +
                "Feel free to ask me anything!";

        // Save to messages table
        Message welcomeMessage = Message.builder()
                .conversation(chatbotConversation.getConversation())
                .sender(botUser)
                .content(welcomeText)
                .messageType("text")
                .createdAt(LocalDateTime.now())
                .build();
        welcomeMessage = messageRepository.save(welcomeMessage);

        // Save to chatbot_messages for tracking
        ChatbotMessage chatbotMessage = ChatbotMessage.builder()
                .chatbotConversation(chatbotConversation)
                .role(ChatbotMessage.Role.assistant)
                .content(welcomeText)
                .message(welcomeMessage)
                .tokensUsed(0)
                .createdAt(LocalDateTime.now())
                .build();
        chatbotMessageRepository.save(chatbotMessage);

        // Publish event để WebSocket gửi message real-time
        eventPublisher.publishEvent(new MessageEvent(this, welcomeMessage));
    }

    /**
     * Xử lý message từ user và generate response
     */
    @Override
    @Transactional
    public ChatbotResponse sendMessage(User user, ChatbotMessageRequest request) {
        try {
            // Get or create chatbot conversation
            ChatbotConversation chatbotConversation = getOrCreateChatbotConversation(user);

            // Get bot user
            User botUser = userRepository.findById(BOT_USER_ID)
                    .orElseThrow(() -> new RuntimeException("Bot user not found"));

            // Save user message to messages table
            Message userMessage = Message.builder()
                    .conversation(chatbotConversation.getConversation())
                    .sender(user)
                    .content(request.getContent())
                    .messageType("text")
                    .createdAt(LocalDateTime.now())
                    .build();
            userMessage = messageRepository.save(userMessage);

            // Save to chatbot_messages
            ChatbotMessage userChatbotMessage = ChatbotMessage.builder()
                    .chatbotConversation(chatbotConversation)
                    .role(ChatbotMessage.Role.user)
                    .content(request.getContent())
                    .message(userMessage)
                    .tokensUsed(0)
                    .createdAt(LocalDateTime.now())
                    .build();
            chatbotMessageRepository.save(userChatbotMessage);

            // Publish event để WebSocket gửi user message real-time
            eventPublisher.publishEvent(new MessageEvent(this, userMessage));

            // Get conversation history for context
            List<ChatbotMessage> recentMessages = chatbotMessageRepository
                    .findByChatbotConversationOrderByCreatedAtDesc(
                            chatbotConversation,
                            PageRequest.of(0, CONTEXT_HISTORY_LIMIT)
                    );

            // Reverse để có thứ tự chronological
            List<GeminiService.ChatMessage> conversationHistory = recentMessages.stream()
                    .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                    .map(msg -> new GeminiService.ChatMessage(
                            msg.getRole().name(),
                            msg.getContent()
                    ))
                    .collect(Collectors.toList());

            // Get system prompt
            String systemPrompt = getSystemPrompt();

            // Call Gemini API
            String botResponse = geminiService.generateResponse(conversationHistory, systemPrompt);

            // Save bot response to messages table
            Message botMessage = Message.builder()
                    .conversation(chatbotConversation.getConversation())
                    .sender(botUser)
                    .content(botResponse)
                    .messageType("text")
                    .createdAt(LocalDateTime.now())
                    .build();
            botMessage = messageRepository.save(botMessage);

            // Save to chatbot_messages
            ChatbotMessage botChatbotMessage = ChatbotMessage.builder()
                    .chatbotConversation(chatbotConversation)
                    .role(ChatbotMessage.Role.assistant)
                    .content(botResponse)
                    .message(botMessage)
                    .tokensUsed(estimateTokens(botResponse))
                    .createdAt(LocalDateTime.now())
                    .build();
            chatbotMessageRepository.save(botChatbotMessage);

            // Update conversation timestamp
            chatbotConversation.setUpdatedAt(LocalDateTime.now());
            chatbotConversationRepository.save(chatbotConversation);

            // Publish event để WebSocket gửi bot response real-time
            eventPublisher.publishEvent(new MessageEvent(this, botMessage));

            // Build response
            return ChatbotResponse.builder()
                    .success(true)
                    .message("Message sent successfully")
                    .botMessage(ChatbotMessageResponse.builder()
                            .id(botChatbotMessage.getId())
                            .role("assistant")
                            .content(botResponse)
                            .createdAt(botMessage.getCreatedAt())
                            .messageId(botMessage.getId())
                            .build())
                    .conversationId(chatbotConversation.getConversation().getId())
                    .build();

        } catch (Exception e) {
            log.error("Error processing chatbot message: ", e);
            return ChatbotResponse.builder()
                    .success(false)
                    .message("Failed to process message: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get system prompt (có thể lấy từ database)
     */
    private String getSystemPrompt() {
        // TODO: Có thể lấy từ chatbot_prompts table
        return "You are Linkly Assistant, a helpful AI assistant for the Linkly social media platform. " +
                "Help users with features, answer questions, and provide friendly responses. " +
                "Keep responses concise and engaging. Use emojis occasionally.";
    }

    /**
     * Estimate tokens used (rough estimation)
     */
    private int estimateTokens(String text) {
        // Rough estimation: 1 token ≈ 4 characters
        return text.length() / 4;
    }
}