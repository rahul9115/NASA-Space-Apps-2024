import { RiTranslate2 } from "react-icons/ri";
import { MdOutlineSummarize, MdOutlineModeEditOutline, MdOutlineMailOutline } from "react-icons/md";
import { PiPackage } from 'react-icons/pi';
import { LuTableProperties } from 'react-icons/lu';
import { FiThumbsUp } from 'react-icons/fi';
import { BsCalculator } from 'react-icons/bs';
import OptionBox from "./OptionBox";
import './OptionContainer.css';
import { PiPlantBold } from "react-icons/pi";
import { IoRainyOutline } from "react-icons/io5";
import { TiWeatherSunny } from "react-icons/ti";
import { BsMoisture } from "react-icons/bs";
import { GiCoalPile } from "react-icons/gi";


import React, { useState, useEffect } from 'react';
import { useSource } from "../../../SourceContext";

const OptionContainer = ({setInputValue, handleSubmit, isOpen}) => {
    const {source, setSource} = useSource();

    const webOptions = [
        {
            title: "Check Rainfall",
            question: "What is the rainfall pattern in my area?",
            symbol: <IoRainyOutline style={{color:'#576649', width: '1.2rem', height: '1.2rem'}}/>
        },
        {
            title: "Get seasonality",
            question: "What is the best time of year to plant crops in my region?",
            symbol: <TiWeatherSunny style={{color:'#B1976E', width: '1.2rem', height: '1.2rem'}} />
        },
        {
            title: "See soil moisture",
            question: "What is the soil moisture of my area?",
            symbol: <BsMoisture style={{color:'#ADC2A4', width: '1.2rem', height: '1.2rem'}} />
        },
        {
            title: "Improve soil",
            question: "How can I improve the quality of my soil for better crop yields?",
            symbol: <GiCoalPile style={{color:'#7D6A59', width: '1.2rem', height: '1.2rem'}} />
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