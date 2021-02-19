import React, {useEffect, useState} from "react";
import '../styles/PreviewSendMedia.css';
import CloseIcon from "@material-ui/icons/Close";
import {IconButton, TextField} from "@material-ui/core";
import {getObjLength} from "../Helpers";
import {Send} from "@material-ui/icons";
import {ATTACHMENT_TYPE_IMAGE, ATTACHMENT_TYPE_VIDEO, EMPTY_IMAGE_BASE64} from "../Constants";

function PreviewSendMedia(props) {
    const data = props.data;

    const [chosenFile, setChosenFile] = useState();
    const [captions, setCaptions] = useState({});
    const [currentCaption, setCurrentCaption] = useState("");

    const hidePreview = () => {
        props.setPreviewSendMediaVisible(false);
    }

    const changePreview = (index) => {
        if (index >= 0 && getObjLength(data) > index) {
            setChosenFile(data[index]);
        }
    }

    const send = () => {
        const finalData = data;

        // Inject captions
        const finalPreparedData = {};
        Object.entries(finalData).map((curChosenFile, index) => {
            const copyCurChosenFile = curChosenFile[1];
            copyCurChosenFile.caption = captions[copyCurChosenFile.key] ?? '';
            finalPreparedData[copyCurChosenFile.key] = copyCurChosenFile;
        });

        // Send
        props.sendHandledChosenFiles(finalData);

        // Hide
        props.setPreviewSendMediaVisible(false);
    }

    useEffect(() => {
        if (chosenFile && data) {
            const handleKey = (event) => {
                if (event.keyCode === 27) { // Escape
                    hidePreview();
                } else if (event.keyCode === 37) { // Left arrow
                    changePreview(parseInt(chosenFile.key) - 1);
                } else if (event.keyCode === 39) { // Right arrow
                    changePreview(parseInt(chosenFile.key) + 1);
                }
            };

            document.addEventListener('keydown', handleKey);

            return () => {
                document.removeEventListener('keydown', handleKey);
            };
        }
    }, [chosenFile, data]);

    useEffect(() => {
        if (chosenFile) {
            setCaptions(prevState => {
                const newState = {};
                newState[chosenFile.key] = currentCaption;

                return {...prevState, ...newState};
            })
        }
    }, [currentCaption]);

    useEffect(() => {
        // Preview first one
        if (getObjLength(data) > 0) {
            changePreview(0)
        }

        setCaptions({});

    }, [data]);

    useEffect(() => {
        if (chosenFile) {
            setCurrentCaption(captions[chosenFile.key] ?? '');
        }
    }, [chosenFile, captions]);

    return (
        <div className="previewSendMedia">
            <div className="previewSendMedia__header">
                <CloseIcon onClick={hidePreview}/>
                <span>Preview</span>
            </div>

            <div className="previewSendMedia__preview">
                <div className="previewSendMedia__preview__wrapper">
                    {(chosenFile && chosenFile.attachmentType === ATTACHMENT_TYPE_IMAGE) &&
                    <img className="previewSendMedia__preview__image" src={chosenFile.fileURL} alt="Preview" />
                    }
                    {(chosenFile && chosenFile.attachmentType === ATTACHMENT_TYPE_VIDEO) &&
                    <video className="previewSendMedia__preview__video" src={chosenFile.fileURL} controls={true} />
                    }
                </div>

                {(chosenFile && chosenFile.attachmentType !== ATTACHMENT_TYPE_IMAGE && chosenFile.attachmentType !== ATTACHMENT_TYPE_VIDEO) &&
                <div>
                    {chosenFile.attachmentType}, <span className="searchOccurrence">{chosenFile.file?.name}</span>
                </div>
                }
            </div>

            <div className="previewSendMedia__caption">
                <TextField value={currentCaption} onChange={e => setCurrentCaption(e.target.value)} label="Add a caption..." size="medium" fullWidth={true} />
            </div>

            <div className="previewSendMedia__footer">

                <div className="previewSendMedia__footer__inner">
                    { Object.entries(data).map((file, index) => {
                        return (
                            <span key={file[0]}
                                  className={"previewSendMedia__footer__thumbnail" + (chosenFile === file[1] ? " chosenFile" : "")}
                                  onClick={() => changePreview(file[0])}>
                            <img
                                className="previewSendMedia__footer__thumbnail__image"
                                src={file[1].attachmentType === ATTACHMENT_TYPE_IMAGE ? file[1].fileURL : EMPTY_IMAGE_BASE64}
                                alt="Thumbnail"
                            />
                        </span>
                        )
                    }) }
                </div>

                <div className="previewSendMedia__footer__sendWrapper">
                    <IconButton className="previewSendMedia__footer__send" onClick={send}>
                        <Send />
                    </IconButton>
                </div>

            </div>
        </div>
    )
}

export default PreviewSendMedia;