import React, { useState, useEffect, useRef} from 'react';
import { TbPaperclip } from "react-icons/tb";
import { FaArrowUp } from "react-icons/fa6";
import FilePrev from './FilePrev';
import "./ChatBox.css";
import { useSource } from '../../../SourceContext';
import { FaMicrophoneAlt } from "react-icons/fa";
// import HoverDescription from '../../HoverDescription';
import { FaRegStopCircle } from "react-icons/fa";
import axios from 'axios';

const ChatBox = ({isLoading, inputFiles, setInputFiles, showFiles, setShowFiles, textareaRef, handleSubmit, inputValue, setInputValue, refProp}) => {
    const {source, setSource} = useSource();
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null); // Stores the URL of the recorded audio
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const sourceRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]); // To store the audio chunks

    useEffect(() => {
        if (isRecording) {
        startRecording();
        } else {
        stopRecording();
        }

        return () => {
        stopRecording();  // Ensure we clean up when component unmounts
        };
    }, [isRecording]);

    const startRecording = async () => {
        try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;
        }

        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 2048; // Size of the FFT (Fast Fourier Transform)
        analyserRef.current = analyser;

        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyser); // Connect the source to the analyser
        sourceRef.current = source;

        const bufferLength = analyser.frequencyBinCount; // Frequency bin count is half of fftSize
        const dataArray = new Uint8Array(bufferLength); // Create data array to hold time-domain data
        dataArrayRef.current = dataArray; // Store the reference for later use

        // Initialize MediaRecorder
        const mediaRecorder = new MediaRecorder(stream, {mimeType: 'audio/webm'});
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        // On data available (audio chunk)
        mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        // On stop (when the recording ends)
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioURL(audioUrl);
            
            // Send the audio blob to the API
            const formData = new FormData();
            formData.append('file', audioBlob, 'output.webm');  // Append the Blob to the FormData
        
            // var response = (await axios.post(`${process.env.REACT_APP_URL_BASE}/ai_agent`, api_object)).data;
            // Send the FormData to the API using axios
            axios.post(`${process.env.REACT_APP_URL_BASE}/audio_call`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(response => {
                console.log('File uploaded successfully:', response.data);
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
        };

        // Start the MediaRecorder
        mediaRecorder.start();

        // Start drawing the waveform
        drawWaveform();
        } catch (error) {
        console.error('Error starting the recording:', error);
        }
    };

    const stopRecording = () => {
        // Stop the MediaRecorder
        if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop(); // Stop the MediaRecorder, which triggers the `onstop` event
        }

        // Stop the stream
        if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        }

        // Disconnect the audio nodes
        if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
        }

        // Close the AudioContext if it's not already closed
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
        }
    };

    const drawWaveform = () => {
        const canvas = canvasRef.current;
        const canvasContext = canvas.getContext('2d');
        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;

        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        const draw = () => {
        if (!isRecording) return; // Stop drawing when recording is stopped

        requestAnimationFrame(draw); // Continuously update the drawing

        analyser.getByteTimeDomainData(dataArray); // Get time-domain data

        // Clear canvas
        canvasContext.fillStyle = '#FFFFFF';
        canvasContext.fillRect(0, 0, WIDTH, HEIGHT);

        // Set up the line drawing
        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = 'rgb(0, 0, 0)';

        canvasContext.beginPath();

        const sliceWidth = (WIDTH * 1.0) / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0; // Normalize the values
            const y = (v * HEIGHT) / 2;

            if (i === 0) {
            canvasContext.moveTo(x, y);
            } else {
            canvasContext.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasContext.lineTo(canvas.width, canvas.height / 2);
        canvasContext.stroke();
        };

        draw(); // Start drawing the waveform
    };

    // Update chat to have nothing if session changes and is empty
    useEffect(() => {
        setInputValue("");
        setShowFiles(false);
    }, [source.session.session_id]);

    useEffect(() => {
        if (inputFiles.length === 0) {
            setShowFiles(false);
        }
    }, [inputFiles]);

    // Allows user to click enter outside chat window and still send message
    useEffect(() => {
        const globalHandleKeyDown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if ((inputValue !== "" || inputFiles.length > 0) && inputFiles.every(file => file.loaded) && !isLoading) {
                    handleSubmit();
                }
            }
        };

        window.addEventListener('keydown', globalHandleKeyDown);

        return () => {
            window.removeEventListener('keydown', globalHandleKeyDown);
        };
    }, [inputValue, inputFiles, handleSubmit]);

    const autoResize = () => {
        if (!textareaRef.current || !refProp.current) return;

        const textarea = textareaRef.current;
        const maxHeight = window.getComputedStyle(refProp.current).maxHeight;
        const numericMaxHeight = parseFloat(maxHeight);
        
        textarea.style.height = 'auto';
    
        textarea.style.height = textarea.scrollHeight - 8 + 'px';
    
        if (textarea.scrollHeight - 8 <= numericMaxHeight) {
            textarea.style.overflowY = 'hidden';
        } else {
            textarea.style.overflowY = '';
        }
    };

    const handleRecord = () => {
        setIsRecording(!isRecording);
    }

    return (
        <div className='chatbox' ref={refProp}>
            {/* {audioURL && (
                <div>
                <h3>Recorded Audio:</h3>
                <audio controls src={audioURL}></audio>
                <a href={audioURL} download="recording.webm">Download Audio</a>
                </div>
            )} */}
            <div className='chat-row'>
                <div className={`file-upload-chat ${isRecording && "recording"}`} onClick={handleRecord}>
                    {isRecording ? <FaRegStopCircle size={"1.55rem"} style={{position: 'absolute'}}/> : <FaMicrophoneAlt size={"1.55rem"} style={{position: 'absolute'}}/>}
                    {/* <HoverDescription description={"Attach File"} position='top'/> */}
                </div>
                {(isRecording || audioURL) ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {(!audioURL || isRecording) && 
                        <canvas
                        ref={canvasRef}
                        style={{ width: '37.5rem', height: '3rem', marginRight: '1rem' }}
                        />}
                        {(audioURL && !isRecording) && <div style={{fontSize:'14px'}}>Audio Recorded!</div>}
                    </div>
                    ) : (
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask AgriDash a question..."
                        rows={1}
                        spellCheck="false"
                        className="chat-textarea"
                        ref={textareaRef}
                        onInput={autoResize}
                    />
                )}
                <div className='send-button' style={(inputValue !== "" || audioURL) && !isRecording && !isLoading ? {cursor:'pointer'} : {backgroundColor:"var(--grey)"}} onClick={() => { if ((inputValue !== "" || audioURL) && !isRecording && !isLoading) handleSubmit(); }}>
                    <FaArrowUp size={"1.25rem"}/>
                </div>
            </div>
        </div>
    );
}

export default ChatBox;