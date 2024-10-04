import React, { useState, useEffect, useRef } from 'react';
import './MessageContainer.css'
import axios from 'axios';
import Message from './Message';
import { useSource } from '../../../SourceContext';

const MessageContainer = ({isLoading, refProp, isOpen}) => {
    // const data = '[{"role":"user","content":[{"type":"text","text":"Thanks!"}]},{"role":"assistant","content":"You\'re welcome! If you have any more questions or need assistance with anything else, feel free to ask!"},{"role":"user","content":[{"type":"text","text":"Thanks!"}]},{"role":"assistant","content":"You\'re welcome again! If you need anything else, just let me know. Have a great day!"},{"role":"user","content":[{"type":"text","text":"Thanks!"}]},{"role":"assistant","content":"You\'re very welcome! If there\'s anything else on your mind, don\'t hesitate to reach out. Enjoy your day!"},{"role":"user","content":[{"type":"text","text":"Thanks!"}]},{"role":"assistant","content":"You\'re welcome! If you need anything, just let me know. I\'m here to help!"}]';
    // const dataList = JSON.parse(data);
    const {source, setSource} = useSource();
    const messagesRef = useRef(null);

    useEffect(() => {
        if (refProp && refProp.current) {
            const handleResize = () => {
                if (refProp.current instanceof Element) {
                    const computedStyle = window.getComputedStyle(refProp.current);
                    const elementHeight = parseFloat(computedStyle.height);
    
                    document.documentElement.style.setProperty('--dynamic-height', `${elementHeight}px`);
                }
            };
    
            handleResize();
    
            const observer = new ResizeObserver(handleResize);
            observer.observe(refProp.current);
    
            return () => {
                if (refProp.current) {
                    observer.disconnect();
                }
            };
        }
    }, [refProp]);

    // useEffect(async () => {
    //     var response = await axios.get(`${process.env.REACT_APP_URL_BASE}/session/?user_id=0`);
    //     var json_data = JSON.parse(response.data.sessions[1]["messages"]);
    //     console.log(json_data)
    //     setSource(prev => ({
    //         ...prev,
    //         'session':json_data
    //     }));
    // }, []);

    return (
        <div className='message-container' ref={messagesRef}>
            {/* appears at bottom cause its reversed */}
            {isLoading && <Message isLoading={isLoading}/>}
            {/* mapped in reverse so that column reverse starts at bottom */}
            {[...source.session.messages].reverse().map((item, index) => (
                <Message key={index} item={item} />
            ))}
        </div>
    );
};

export default MessageContainer;