import React, { useEffect, useState, useRef } from 'react';
import { useSource } from '../../../SourceContext';
import './OptionContainer.css';

const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?"

const delay = ms => new Promise(
    resolve => setTimeout(resolve, ms)
);

function OptionBox({ setInputValue, handleSubmit, symbol = 'sym', title, question = lorem }) {
    const [isInputUpdated, setIsInputUpdated] = useState(false);
    const {source, setSource} = useSource();
    const inputRef = useRef(null);

    useEffect(() => {
        if (isInputUpdated) {
            handleSubmit();
            setIsInputUpdated(false);
        }
    }, [isInputUpdated, handleSubmit]);

    const handleClickWeb = () => {
        setInputValue(question);
        setIsInputUpdated(true);
    };

    const handleClickWork = async () => {
        setSource(prev => ({
            ...prev,
            'recs':false
        }));
        inputRef.current = document.querySelector('.rsc-input');
        // Create a synthetic event
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(inputRef.current, question);

        const event = new Event('input', { bubbles: true });
        inputRef.current.dispatchEvent(event);

        inputRef.current.focus();
        await delay(500);
        const button = document.querySelector('.rsc-submit-button');
        if (button) {
        // Click the button
            button.click();
        }
    };

    return (
        <div onClick={source.type === "web" ? handleClickWeb : handleClickWork} className='opbox-cont'>
            <div className='option-header'>
                {symbol}
                <div className='option-title'>{title}</div>
            </div>
            <div className='question-cont'>
                <div className='question'>
                    {question}
                </div>
            </div>
        </div>
    );
}

export default OptionBox;