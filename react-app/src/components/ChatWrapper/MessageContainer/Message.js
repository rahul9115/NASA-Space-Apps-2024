import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PulseLoader } from 'react-spinners';
import { ImFilesEmpty } from "react-icons/im";


const Message = ({item={content:""}, isLoading=false}) => {
    var userMessage = false
    if (item.role === "user") {
        userMessage = true
    }
        
    var message = "";
    var files = false;
    if (typeof item.content === 'string') {
        message = item.content
    } else if (Array.isArray(item.content)) {
        message = item.content[item.content.length - 1].text
        if (item.content.length > 1) {
            files = true;
        }
    }
    return (
        <>
            {userMessage ?
            <>
                {message != "" &&
                <div className='message-row t-user'>
                    <div className='user-message'>
                        {message}
                    </div>
                </div>
                }
                {files && 
                <div className='message-row t-user' style={{marginBottom:".5rem", height:"1rem"}}>
                    <div className='user-message'>
                        Files Uploaded
                        <ImFilesEmpty size="1rem" style={{marginLeft:".4rem"}}/>
                    </div>
                </div>
                }
            </>
            :
            <div className='message-row t-assistant'>
                <div className='assistant-message'>
                    <div className='phoebe-icon'>
                        {/* <img src={ChatLogo} alt={"chat_logo.png"}/> */}
                    </div>
                    <div style={{width:"41rem"}}>
                        {isLoading ? 
                            <PulseLoader cssOverride={{paddingTop:"1.2rem"}} size={5} margin={5} speedMultiplier={.5} />
                            :
                            <ReactMarkdown>{message}</ReactMarkdown>
                        }
                    </div>
                </div>
            </div>
            }
        </>
    );
};

export default Message;