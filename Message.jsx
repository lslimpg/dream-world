import React, { useState, useEffect, useMemo } from 'react'

function Message({msg, delay, callback}) {
    const [idx, setIdx] = useState(0);
    const [text, setText] = useState('');
    const length = useMemo(() => msg.length, [msg]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setText(text + msg[idx]);
            setIdx(idx + 1);
        }, delay);
        if (idx == length) {
            callback();
            return (clearTimeout(timeout));
        }
    })

    return (
        <div style={{fontSize: '1.2em'}}>{text}</div>
    )
}

export default React.memo(Message);