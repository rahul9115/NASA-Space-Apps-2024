import React, { useState, useEffect } from 'react';
import { CgFileDocument } from "react-icons/cg";
import { IoClose } from "react-icons/io5";
import { LuFileSpreadsheet } from "react-icons/lu";
import { imageToBase64, pdfToBase64 } from '../../../utilities/general';
import { ScaleLoader } from 'react-spinners';
import './ChatBox.css'

const FilePrev = ({index, file, handleDelete, updateFile}) => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const processFile = async () => {
            let base64 = '';
            if (file.type === 'application/pdf') {
                base64 = await pdfToBase64(file.object);
            } else {
                base64 = await imageToBase64(file.object);
            }
            file.base64 = base64;
            file.loaded = true;
            updateFile(index, { ...file });

            setTimeout(() => {
                setIsLoading(false);
            }, 0);
          };
        processFile();
      }, []);

    const renderFileImage = () => {
        if (file.type === "application/pdf") {
            return (
                <div className="file-prev" style={{backgroundColor:"var(--red)"}}>
                    {isLoading && <ScaleLoader color={"var(--white)"} height={18} width={2.5}/>}
                    {!isLoading && <CgFileDocument />}
                </div>
            );
        } else if (file.type === "text/csv") {
            return (
                <div className="file-prev"  style={{backgroundColor:"#7FC41C"}}>
                    {isLoading && <ScaleLoader color={"var(--white)"} height={18} width={2.5}/>}
                    {!isLoading && <LuFileSpreadsheet />}
                </div>
            );
        }
    }

    const renderType = () => {
        if (file.type === "application/pdf") {
            return (
                "PDF"
            );
        } else if (file.type === "text/csv") {
            return (
                "Spreadsheat"
            );
        }
    }

    return (
        <div>
            { file.type && file.type.startsWith('image/') ?
                <div className="file-image-container">
                    <div className="file-image">
                        {isLoading && <div className="loading-overlay"></div>}
                        <img src={URL.createObjectURL(file.object)} alt={`${file.name}`} className='image-preview' />
                    </div>
                    <div className="delete-btn" onClick={() => handleDelete(file.name)}>
                        <IoClose />
                    </div>
                </div>
                :
                <div className="file-cont">
                    <div className="delete-btn" onClick={() => handleDelete(file.name)}><IoClose /></div>
                    {renderFileImage()}
                    <div style={{marginLeft:".5rem"}}>
                        <div style={{fontWeight:"700", fontSize:"13px"}}>{file.name}</div>
                        <div>{renderType()}</div>
                    </div>
                </div>
            }
        </div>
    );
};

export default FilePrev;