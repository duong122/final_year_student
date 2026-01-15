package com.example.backend.repository;

import com.example.backend.entity.ChatbotMessage;
import com.example.backend.entity.ChatbotConversation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatbotMessageRepository extends JpaRepository<ChatbotMessage, Long> {

    /**
     * Find recent messages in a chatbot conversation (for context)
     * Ordered by created_at DESC
     */
    List<ChatbotMessage> findByChatbotConversationOrderByCreatedAtDesc(
            ChatbotConversation chatbotConversation,
            Pageable pageable
    );

    /**
     * Find messages by chatbot conversation ID
     */
    List<ChatbotMessage> findByChatbotConversationIdOrderByCreatedAtAsc(Long chatbotConversationId);

    /**
     * Count total messages in a conversation
     */
    long countByChatbotConversationId(Long chatbotConversationId);

    /**
     * Get total tokens used by user
     */
    @Query("SELECT SUM(cm.tokensUsed) FROM ChatbotMessage cm " +
            "WHERE cm.chatbotConversation.user.id = :userId")
    Long getTotalTokensUsedByUser(Long userId);
}