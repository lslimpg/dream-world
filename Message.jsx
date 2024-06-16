import React, { useState, useEffect } from 'react'

function Message({msg, delay, callback}) {
    const [idx, setIdx] = useState(0);
    const [text, setText] = useState('');
    const length = msg.length;

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (idx < length) {
                setText(text + msg[idx]);
                setIdx(idx + 1);
            } else {
                console.log('end');
                callback();
            }
        }, delay);
        return () => {
            clearTimeout(timeout);
        }
    }, [text, msg, idx])
    // useEffect(() => callback(), []);

    return (
        <div style={{fontSize: '1.2em'}}>{text}</div>
    )
}

// export default React.memo(Message);
export default Message;