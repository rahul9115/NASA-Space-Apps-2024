import './ChatWrapper.css'
import React, {useState, useEffect, useRef} from 'react';
import OptionBox from './OptionContainer/OptionBox';
// import ChatLogo from '../../images/phoebe.png'
import { RiTranslate2 } from "react-icons/ri";
// import { uploadS3Object } from '../../utilities/aws_apis';
import { PiPackage } from 'react-icons/pi';
import { LuTableProperties } from 'react-icons/lu';
import { FiThumbsUp } from 'react-icons/fi';
import { BsCalculator } from 'react-icons/bs';
// import Agent from './Agent/Agent';
import { useSource } from '../../SourceContext';
import { getRandomString } from '../../utilities/general';
import OptionContainer from './OptionContainer/OptionContainer';
import MessageContainer from './MessageContainer/MessageContainer';
import ChatBox from './ChatBox/ChatBox';
import { formatUserMessage, formatAssistantMessage } from '../../utilities/general';
import system_prompt from '../../utilities/system_prompt.json'
import axios from 'axios';
// import { callGPT } from '../../utilities/gpt_apis';
// import PQLogo from '../../images/pq-logo.png';

function ChatWrapper() {
    const {source, setSource} = useSource();
    const chatBoxRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [showFiles, setShowFiles] = useState(false);
    const textareaRef = useRef(null);
    const [inputFiles, setInputFiles] = useState([]);

    const addToSystemPrompt = (system_prompt) => {
        const date = new Date();
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        const date_sentence = "Today's current date is " + formattedDate + " " + formattedTime;
        system_prompt["content"] += date_sentence;

        return system_prompt
    }

    const postChatAudit = async (message, files, gpt_response) => {
        const filePaths = files.map(obj => `user_id=${source.user.user_id}/${obj.name}`);
        const audit_obj = {
            message: JSON.stringify({"message": message, "files": filePaths}),
            input_tokens: gpt_response.input_tokens,
            output_tokens: gpt_response.output_tokens,
            user_id: source.user.user_id
        }
        try {
            axios.post(`${process.env.REACT_APP_URL_BASE}/gpt-chat-audit/`, audit_obj);
        } catch (error) {
            if (error.response && error.response.status === 400) {
            console.log("400 Error: ", error.response.data);
            } else {
            console.log("An error occurred: ", error.message);
            }
        }
      }

    const handleSubmit = async () => {
        // Prep variables for messages before
        const message = inputValue;
        const newMessage = await formatUserMessage(inputFiles, message);
        var allMessages = [...source.session.messages, newMessage]

        // Reset input values and input files
        setInputValue('');
        setShowFiles(false);
        const textarea = textareaRef.current;
        textarea.style.height = '1.5rem';

        setInputFiles([]);
        // Clear the actual file input element
        const fileInput = document.getElementById('file-input');
        const dataTransfer = new DataTransfer();
        fileInput.files = dataTransfer.files;

        // Adduser message to source.session.messages to display
        setSource(prev => ({
            ...prev,
            session: {
                ...prev.session,
                messages: allMessages
            }
        }));

        // Set loading true
        setTimeout(() => {
            setIsLoading(true);
        }, 0);


        // Call ChatGPT and Add to Messages
        const object = {
            messages: [addToSystemPrompt(system_prompt), ...allMessages],
            model: "gpt-4o-mini",
            temperature: 0.0,
            top_p: 1.0
        };
        
        //var response = await callGPT(object)
        var response = (await axios.post(`${process.env.REACT_APP_URL_BASE}/api/gpt`, object)).data;

        // Log user message
        // ADD BACK WHEN LOGGING USER MESSAGE
        postChatAudit(message, inputFiles, response)

        var newMessages = [...allMessages, formatAssistantMessage(response.answer)];
        if (newMessages.length > 10) {
            newMessages.shift();
        }

        handleSessionDB(newMessages);

        setSource(prev => ({
            ...prev,
            session: {
                ...prev.session,
                messages: newMessages
            }
        }));
        // Set loading false
        setTimeout(() => {
            setIsLoading(false);
        }, 0);
    };

    const handleSessionDB = async (messages) => {
        // Create new session object
        let session_obj = {}
    
        // Add summary to session
        const prompt = "Summarize my current context in 4 words or less";
        const messagesWithPrompt = [...messages, await formatUserMessage([], prompt)];
        const object = {
            messages: messagesWithPrompt,
            model: "gpt-4o-mini",
            temperature: 0.0,
            top_p: 1.0
        };
    
        // Call the API for summary
        const response = (await axios.post(`${process.env.REACT_APP_URL_BASE}/api/gpt`, object)).data;
        const summary = response.answer;
    
        // Function to filter out image messages
        const filterImageMessages = (msgList) => msgList.map(message => {
            if (message.role === 'user' && Array.isArray(message.content) && message.content.length > 1) {
                const newMessage = { ...message };
                // Filter content to only keep the text type
                newMessage.content = newMessage.content.filter(item => item.type === 'text');
                return newMessage;
            }
            return message;
        });
    
        // Handle new session
        if (Object.keys(source.session.messages).length === 0) {
            const no_image_messages = filterImageMessages(messages);
            session_obj = {
                session_id: getRandomString(16),
                user_id: source.user.user_id,
                messages: messages, // Keep array form here
                summary: summary,
                create_datetime: new Date().toUTCString(),
                update_datetime: new Date().toUTCString()
            };
        
            try {
                const apiSession = { ...session_obj, messages: JSON.stringify(no_image_messages) }; // Stringify messages for API
                await axios.post(`${process.env.REACT_APP_URL_BASE}/session/`, apiSession);
    
                // Add new session to all_sessions
                setSource(prev => ({
                    ...prev,
                    all_sessions: [...prev.all_sessions, session_obj],
                    session: session_obj
                }));
            } catch (error) {
                console.log(error.response?.status === 400 ? `400 Error: ${error.response.data}` : `An error occurred: ${error.message}`);
            }
        } else {
            // Handle session update
            const no_image_messages = filterImageMessages(messages);
            session_obj = {
                session_id: source.session.session_id,
                user_id: source.user.user_id,
                messages: messages, // Keep array form here
                summary: summary,
                create_datetime: source.session.create_datetime,
                update_datetime: new Date().toUTCString()
            };
        
            // Update all_sessions
            const sessionIndex = source.all_sessions.findIndex(session => session.session_id === session_obj.session_id);
            if (sessionIndex !== -1) {
                setSource(prev => ({
                    ...prev,
                    all_sessions: prev.all_sessions.map(session =>
                        session.session_id === session_obj.session_id
                        ? { ...session, summary: session_obj.summary, messages: session_obj.messages, update_datetime: session_obj.update_datetime }
                        : session
                    ),
                    session: session_obj
                }));
            }
    
            try {
                const apiSession = { ...session_obj, messages: JSON.stringify(no_image_messages) }; // Stringify messages for API
                await axios.put(`${process.env.REACT_APP_URL_BASE}/session/`, apiSession);
            } catch (error) {
                console.log(error.response?.status === 400 ? `400 Error: ${error.response.data}` : `An error occurred: ${error.message}`);
            }
        }
    };

    return(
        <>
            {/* <HistoryNav isOpen={isOpen} setIsOpen={setIsOpen}/> */}
            {
                source.session.messages.length === 0 ?
                <OptionContainer setInputValue={setInputValue} handleSubmit={handleSubmit}/>
                :
                <MessageContainer isLoading={isLoading} setIsLoading={setIsLoading} refProp={chatBoxRef}/>
            }
            <ChatBox isLoading={isLoading} inputFiles={inputFiles} setInputFiles={setInputFiles} showFiles={showFiles} setShowFiles={setShowFiles} textareaRef={textareaRef} handleSubmit={handleSubmit} handleSessionDB={handleSessionDB} inputValue={inputValue} setInputValue={setInputValue} setIsLoading={setIsLoading} refProp={chatBoxRef}/>
            <div className='bottom-text'>AgriDash can make mistakes. Please check your sources.</div>
        </>
    )
}

export default ChatWrapper;