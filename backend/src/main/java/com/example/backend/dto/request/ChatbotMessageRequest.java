package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotMessageRequest {

    @NotBlank(message = "Message content cannot be empty")
    @Size(max = 3000, message = "Message content cannot exceed 3000 characters")
    private String content;
}