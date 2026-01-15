
package com.example.backend.event;

import com.example.backend.entity.Message;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event được publish khi có message mới
 * WebSocket listener sẽ bắt event này và broadcast message
 */
@Getter
public class MessageEvent extends ApplicationEvent {

    private final Message message;

    public MessageEvent(Object source, Message message) {
        super(source);
        this.message = message;
    }
}