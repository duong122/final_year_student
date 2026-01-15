package com.example.backend.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event khi có người comment
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewCommentEvent {
    private Long postId;
    private Long commenterId;
}
