package com.example.backend.repository;

import com.example.backend.entity.ChatbotConversation;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatbotConversationRepository extends JpaRepository<ChatbotConversation, Long> {

    /**
     * Find chatbot conversation by user
     */
    Optional<ChatbotConversation> findByUser(User user);

    /**
     * Find chatbot conversation by user ID
     */
    Optional<ChatbotConversation> findByUserId(Long userId);

    /**
     * Check if user has chatbot conversation
     */
    boolean existsByUserId(Long userId);
}