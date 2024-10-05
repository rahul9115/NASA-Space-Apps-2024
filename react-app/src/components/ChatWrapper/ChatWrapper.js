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
import { formatAllMessages } from '../../utilities/general';
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
    

    const handleSubmit = async () => {
        // Prep variables for messages before
        const message = inputValue;
        const newMessage = await formatUserMessage([], message);
        var allMessages = [...source.session.messages, newMessage]
        const apiMessages = formatAllMessages(source.session.messages, message);

        // Reset input values and input files
        setInputValue('');
        const textarea = textareaRef.current;
        textarea.style.height = '1.5rem';

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

        
         
        // Call ai agent backend
        const api_object = {
            question:apiMessages
        }
        console.log(api_object);
        var response = (await axios.post(`${process.env.REACT_APP_URL_BASE}/ai_agent`, api_object)).data;


        var newMessages = [...allMessages, formatAssistantMessage(response.answer)];
        if (newMessages.length > 10) {
            newMessages.shift();
        }

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

    return(
        <>
            {/* <HistoryNav isOpen={isOpen} setIsOpen={setIsOpen}/> */}
            {
                source.session.messages.length === 0 ?
                <OptionContainer setInputValue={setInputValue} handleSubmit={handleSubmit}/>
                :
                <MessageContainer isLoading={isLoading} setIsLoading={setIsLoading} refProp={chatBoxRef}/>
            }
            <ChatBox isLoading={isLoading} inputFiles={inputFiles} setInputFiles={setInputFiles} showFiles={showFiles} setShowFiles={setShowFiles} textareaRef={textareaRef} handleSubmit={handleSubmit} inputValue={inputValue} setInputValue={setInputValue} setIsLoading={setIsLoading} refProp={chatBoxRef}/>
            <div className='bottom-text'>AgriDash can make mistakes. Please check your sources.</div>
        </>
    )
}

export default ChatWrapper;