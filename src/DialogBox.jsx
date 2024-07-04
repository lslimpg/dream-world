import { useState } from "react";
import { flexbox } from "@mui/system";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Message from "../Message";
import { ButtonBase, CardContent } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

function DialogBox({ msgs, width, height, callback }) {
    const numMsgs = msgs.length;
    const [msgIdx, setMsgIdx] = useState(0);
    const [isLast, setIsLast] = useState(numMsgs == 1);
    const [showCursor, setShowCursor] = useState(false);

    return (
        <Card
            sx={{
                backgroundImage: "url('../assets/dialog_box.png')",
                backgroundSize: "100% 100%",
                border: "1px solid red",
                padding: "2%",
                position: "absolute",
                transform: "translateX(-28%)",
                left: "28%",
                bottom: "10%",
                height: `${Math.ceil(height / 4)}px`,
                width: `${width / 1.5}px`,
            }}
        >
            <CardContent
                sx={{
                    height: "75%",
                    overflowY: "scroll",
                    display: "flex",
                    flexGrow: "1",
                    flexDirection: "column",
                }}
            >
                <Message
                    key={msgIdx}
                    msg={msgs[msgIdx]}
                    delay={25}
                    callback={() => {
                        setShowCursor(true);
                    }}
                ></Message>
                {isLast && showCursor && (
                    <Button
                        sx={{ alignSelf: "flex-end" }}
                        onClick={() => {
                            setMsgIdx(0);
                            setShowCursor(false);
                            callback();
                        }}
                    >
                        Ok
                    </Button>
                )}
                {!isLast && showCursor && (
                    <ButtonBase
                        sx={{ alignSelf: "flex-end" }}
                        onClick={() => {
                            setShowCursor(false);
                            setIsLast(msgIdx + 1 === numMsgs - 1);
                            setMsgIdx(msgIdx + 1);
                        }}
                    >
                        {" "}
                        {<NavigateNextIcon fontSize="large"></NavigateNextIcon>}
                    </ButtonBase>
                )}
            </CardContent>
        </Card>
    );
}

export default DialogBox;
