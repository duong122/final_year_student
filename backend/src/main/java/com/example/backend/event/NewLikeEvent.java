package com.example.backend.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event khi có người like post
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewLikeEvent {
    private Long postId;
    private Long likerId;
}
