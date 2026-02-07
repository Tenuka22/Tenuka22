import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCommandOutputProps {
  output: string | React.ReactNode;
  typingDelay?: number; // Delay between characters in ms
  spinnerDuration?: number; // Duration for spinner before typing starts in ms
}

const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export const AnimatedCommandOutput: React.FC<AnimatedCommandOutputProps> = ({
  output,
  typingDelay = 30,
  spinnerDuration = 500, // Show spinner for 0.5 seconds
}) => {
  const [displayedContent, setDisplayedContent] = useState<string>('');
  const [showSpinner, setShowSpinner] = useState(true);
  const [spinnerFrameIndex, setSpinnerFrameIndex] = useState(0);
  const hasStartedTyping = useRef(false);

  // Function to scroll the terminal to the bottom
  const scrollToBottom = () => {
    const terminal = document.querySelector('.terminal');
    if (terminal) {
      terminal.scrollTop = terminal.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayedContent, showSpinner]);

  useEffect(() => {
    let spinnerInterval: NodeJS.Timeout;
    if (showSpinner) {
      spinnerInterval = setInterval(() => {
        setSpinnerFrameIndex((prevIndex) => (prevIndex + 1) % spinnerFrames.length);
      }, 100);
    }
    return () => {
      if (spinnerInterval) clearInterval(spinnerInterval);
    };
  }, [showSpinner]);

  useEffect(() => {
    const spinnerTimeout = setTimeout(() => {
      setShowSpinner(false);
    }, spinnerDuration);

    return () => clearTimeout(spinnerTimeout);
  }, [spinnerDuration]);

  useEffect(() => {
    if (showSpinner || hasStartedTyping.current) return;

    if (typeof output === 'string') {
      hasStartedTyping.current = true;
      let i = 0;
      const typingInterval = setInterval(() => {
        setDisplayedContent((prev) => prev + output.charAt(i));
        i++;
        if (i >= output.length) {
          clearInterval(typingInterval);
        }
      }, typingDelay);
      return () => clearInterval(typingInterval);
    }
  }, [showSpinner, output, typingDelay]);

  if (showSpinner) {
    return <div className="text-emerald-400">{spinnerFrames[spinnerFrameIndex]}</div>;
  }

  // If output is a string, render the typed text
  if (typeof output === 'string') {
    return <div className="text-emerald-200 whitespace-pre-wrap">{displayedContent}</div>;
  }

  // If output is a React.ReactNode, render it directly after spinner
  return <div className="text-emerald-200">{output}</div>;
};
