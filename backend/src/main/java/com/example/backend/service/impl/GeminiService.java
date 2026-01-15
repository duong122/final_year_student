
package com.example.backend.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service để gọi Google Gemini API
 * Documentation: https://ai.google.dev/api/rest
 */
@Service
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Generate response từ Gemini API
     *
     * @param conversationHistory List of messages (role + content)
     * @param systemPrompt System prompt để define bot behavior
     * @return Bot response
     */
    public String generateResponse(List<ChatMessage> conversationHistory, String systemPrompt) {
        try {
            // Construct request body
            Map<String, Object> requestBody = buildRequestBody(conversationHistory, systemPrompt);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create request entity
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Call API
            String url = apiUrl + "?key=" + apiKey;
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            // Parse response
            return parseResponse(response.getBody());

        } catch (Exception e) {
            log.error("Error calling Gemini API: ", e);
            return "I'm sorry, I'm having trouble responding right now. Please try again later.";
        }
    }

    /**
     * Build request body cho Gemini API
     */
    private Map<String, Object> buildRequestBody(List<ChatMessage> conversationHistory, String systemPrompt) {
        Map<String, Object> requestBody = new HashMap<>();

        // Add contents (conversation history)
        List<Map<String, Object>> contents = new ArrayList<>();

        // Add system prompt as first message (if provided)
        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            Map<String, Object> systemMessage = new HashMap<>();
            systemMessage.put("role", "user"); // Gemini uses "user" for system prompts

            Map<String, Object> systemPart = new HashMap<>();
            systemPart.put("text", systemPrompt);
            systemMessage.put("parts", List.of(systemPart));

            contents.add(systemMessage);

            // Add a dummy assistant response to acknowledge system prompt
            Map<String, Object> ackMessage = new HashMap<>();
            ackMessage.put("role", "model");
            Map<String, Object> ackPart = new HashMap<>();
            ackPart.put("text", "Understood. I will follow these guidelines.");
            ackMessage.put("parts", List.of(ackPart));
            contents.add(ackMessage);
        }

        // Add conversation history
        for (ChatMessage msg : conversationHistory) {
            Map<String, Object> message = new HashMap<>();

            // Gemini API uses "user" and "model" instead of "user" and "assistant"
            String role = msg.getRole().equals("assistant") ? "model" : "user";
            message.put("role", role);

            Map<String, Object> part = new HashMap<>();
            part.put("text", msg.getContent());
            message.put("parts", List.of(part));

            contents.add(message);
        }

        requestBody.put("contents", contents);

        // Add generation config
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("topK", 40);
        generationConfig.put("topP", 0.95);
        generationConfig.put("maxOutputTokens", 1024);
        requestBody.put("generationConfig", generationConfig);

        // Add safety settings
        List<Map<String, Object>> safetySettings = new ArrayList<>();
        String[] categories = {
                "HARM_CATEGORY_HARASSMENT",
                "HARM_CATEGORY_HATE_SPEECH",
                "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "HARM_CATEGORY_DANGEROUS_CONTENT"
        };
        for (String category : categories) {
            Map<String, Object> setting = new HashMap<>();
            setting.put("category", category);
            setting.put("threshold", "BLOCK_MEDIUM_AND_ABOVE");
            safetySettings.add(setting);
        }
        requestBody.put("safetySettings", safetySettings);

        return requestBody;
    }

    /**
     * Parse response từ Gemini API
     */
    private String parseResponse(Map<String, Object> responseBody) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> firstCandidate = candidates.get(0);
                Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

                if (parts != null && !parts.isEmpty()) {
                    Map<String, Object> firstPart = parts.get(0);
                    return (String) firstPart.get("text");
                }
            }

            log.warn("Unexpected response format from Gemini API");
            return "I received an unexpected response. Please try again.";

        } catch (Exception e) {
            log.error("Error parsing Gemini response: ", e);
            return "I had trouble understanding my own response. Please try again.";
        }
    }

    /**
     * Simple DTO for chat messages
     */
    public static class ChatMessage {
        private String role; // "user" or "assistant"
        private String content;

        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() {
            return role;
        }

        public String getContent() {
            return content;
        }
    }
}