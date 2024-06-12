import { useEffect, useState } from "react";
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Message from "../Message";
import { CardContent, Dialog } from "@mui/material";

function DialogBox({msg, width, height, callback}) {
    const [showClose, setClose] = useState(false);
    function onSetClose() {
        setClose(true);
    }
    return (
        <Card sx={{
                backgroundImage: "url('../assets/dialog_box.png')",
                backgroundSize: '100% 100%',
                border: '1px solid red',
                padding:'2%',
                position: 'absolute',
                transform: 'translateX(-28%)',
                left: '28%',
                bottom: '10%',
                height: `${Math.ceil(height/4)}px`,
                width: `${width / 1.5}px`,
            }}>
                <CardContent sx={{ height: '75%', overflowY :'scroll', display: "flex",
                    flexGrow:'1', flexDirection:'column'}}>
                <Message msg={msg} delay={5} callback={onSetClose}></Message>
                {showClose && <Button onClick={() => {
                    setClose(false); callback()}}>Ok</Button>}
                </CardContent>
        </Card>
    )
}

export default DialogBox;