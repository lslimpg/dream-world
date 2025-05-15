import React, { useEffect, useState, useRef } from 'react';

const DialogBox = ({ messages = [], onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const typingInterval = useRef(null);

  const currentMessage = messages[currentIndex];

  // Typewriter effect
  useEffect(() => {
    if (!currentMessage) return;

    setDisplayedText('');
    setIsTyping(true);

    let i = 0;
    clearInterval(typingInterval.current);
    typingInterval.current = setInterval(() => {
      i++;
      setDisplayedText(currentMessage.slice(0, i));
      // setDisplayedText((prev) => prev + currentMessage[i]);
      // i++;
      if (i >= currentMessage.length) {
        clearInterval(typingInterval.current);
        setIsTyping(false);
      }
    }, 30); // speed

    return () => clearInterval(typingInterval.current);
  }, [currentMessage]);

  // Fast-forward or next message
  const handleAdvance = () => {
    if (isTyping) {
      clearInterval(typingInterval.current);
      setDisplayedText(currentMessage);
      setIsTyping(false);
    } else {
      if (currentIndex < Math.max(0, messages.length - 1)) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onComplete();
      }
    }
  };

  // Enter key listener
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter') {
        handleAdvance();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (!currentMessage) return null;

  return (
    <div className="dialog-box" onClick={handleAdvance}>
      <p>{displayedText}</p>
      {!isTyping && <button className="next-button">Next</button>}
    </div>
  );
};

export default DialogBox;
