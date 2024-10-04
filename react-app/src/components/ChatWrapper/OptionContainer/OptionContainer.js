import { RiTranslate2 } from "react-icons/ri";
import { MdOutlineSummarize, MdOutlineModeEditOutline, MdOutlineMailOutline } from "react-icons/md";
import { PiPackage } from 'react-icons/pi';
import { LuTableProperties } from 'react-icons/lu';
import { FiThumbsUp } from 'react-icons/fi';
import { BsCalculator } from 'react-icons/bs';
import OptionBox from "./OptionBox";
import './OptionContainer.css';
import { PiPlantBold } from "react-icons/pi";

import React, { useState, useEffect } from 'react';
import { useSource } from "../../../SourceContext";

const OptionContainer = ({setInputValue, handleSubmit, isOpen}) => {
    const {source, setSource} = useSource();

    const webOptions = [
        {
            title: "Summarize",
            question: "Help me summarize an email.",
            symbol: <MdOutlineSummarize style={{color:'#576649', width: '1.2rem', height: '1.2rem'}}/>
        },
        {
            title: "Translate",
            question: "Can you translate text from English to Spanish?",
            symbol: <RiTranslate2 style={{color:'#B1976E', width: '1.2rem', height: '1.2rem'}} />
        },
        {
            title: "Edit and Proofread",
            question: "Can you proofread and edit my document?",
            symbol: <MdOutlineModeEditOutline style={{color:'#ADC2A4', width: '1.2rem', height: '1.2rem'}} />
        },
        {
            title: "Draft Emails",
            question: "Can you help me draft a professional email?",
            symbol: <MdOutlineMailOutline style={{color:'#7D6A59', width: '1.2rem', height: '1.2rem'}} />
        }
    ];

  return (
    <>
        <div className="small-logo"><PiPlantBold size='5rem' color='var(--header-title)'/></div>
        <div className='options-cont'>
            {webOptions.map((option, index) => (
                <OptionBox 
                    key={index}
                    title={option.title}
                    question={option.question}
                    symbol={option.symbol}
                    handleSubmit={handleSubmit}
                    setInputValue={setInputValue}
                />
            ))}
        </div>
    </>
  );
};

export default OptionContainer;