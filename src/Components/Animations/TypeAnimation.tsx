import React, { useState, useRef, useEffect } from "react";
import "../../GreetingPage.css";
import { useNavigate } from "react-router-dom";
interface TypingAnimationProps {
  onReadyForPhysics?: (nodes: React.ReactNode[]) => void;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({
  onReadyForPhysics,
}) => {
  const navigate = useNavigate();
  // Texts and delays
  const text1 = "Welcome!";
  const text2 = "This is";
  const text3 = "SOCIAL";
  const text4 = "It's all about you here";

  const delay = 1000;
  const buttonsDelay = 1000;
  const speed = 155;
  const skipDelay = 500;

  // State flags
  const [userInteracted, setUserInteracted] = useState(false);
  const [showButtonsState, setShowButtonsState] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  // Mutable ref for cancellation
  const skipRef = useRef(false);

  // Refs to DOM elements
  const welcomeRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLDivElement | null>(null);
  const motoRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);

  // Play beep
  const playBeep = () => {
    if (skipRef.current) return;
    const audio = beepAudioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((e) => console.warn("Beep failed", e));
    }
  };

  // Typing animation
  const typeAnimation = async (
    text: string,
    elementRef: React.RefObject<HTMLElement | null>,
    cursorClass: string,
    keepText = false,
    appendBelow = false,
    opts: { typeSpeed?: number; postDelay?: number } = {}
  ) => {
    const { typeSpeed = speed, postDelay = delay } = opts;
    if (skipRef.current) return;
    const element = elementRef.current;
    const cursor = cursorRef.current;
    if (!element || !cursor) return;
    element.after(cursor);
    cursor.style.display = "inline-block";

    cursor.classList.remove("cursor1", "cursor2", "cursor3");
    cursor.classList.add(cursorClass);

    if (appendBelow) element.innerHTML += "<br/>";
    else if (!keepText) element.innerHTML = "";

    for (let i = 0; i < text.length; i++) {
      if (skipRef.current) return;
      element.innerHTML += text[i];
      playBeep();
      await new Promise((r) => setTimeout(r, typeSpeed));
    }

    await new Promise((r) => setTimeout(r, postDelay));
    if (!keepText && !skipRef.current) {
      playBeep();
      await deleteAnimation(elementRef);
      await new Promise((r) => setTimeout(r, 1000));
    }
  };

  // Deletion animation
  const deleteAnimation = async (
    elementRef: React.RefObject<HTMLElement | null>
  ) => {
    if (skipRef.current) return;
    const element = elementRef.current;
    if (!element) return;
    let content = element.innerHTML;
    while (content.length && !skipRef.current) {
      content = content.slice(0, -1);
      element.innerHTML = content;
      await new Promise((r) => setTimeout(r, 45));
    }
  };
  const didFire = useRef(false);
  const fireReady = (nodes: React.ReactNode[]) => {
    if (didFire.current) return;
    didFire.current = true;
    onReadyForPhysics?.(nodes);
  };
  const falling = () => {
    const nodes: React.ReactNode[] = [
      <span key="social" className="text-[80px] font-jura font-semibold">
        SOCIAL
      </span>,
      <span key="moto" className="text-[35px] font-jura font-normal">
        It&apos;s all about you here
      </span>,
      <button
        key="btn1"
        className="        
            relative text-[27px] text-black  font-jura font-semibold
            pt-2.5 px-5 pb-2.5 mx-3 my-0
            cursor-pointer rounded-md border border-[#999]
            bg-[#DDDDDD] shadow-fancy
            transition-shadow duration-300 ease-linear
            hover:animate-move-colors"
        onClick={() => navigate("/log_in")}
      >
        Log in
      </button>,
      <button
        key="btn2"
        className="        
            relative text-[27px] text-black font-jura  font-semibold
            pt-2.5 px-5 pb-2.5 mx-3 my-0
            cursor-pointer rounded-md border border-[#999]
            bg-[#DDDDDD] shadow-fancy
            transition-shadow duration-300 ease-linear
            hover:animate-move-colors"
        onClick={() => navigate("/sign_up")}
      >
        Sign up
      </button>,
    ];

    fireReady(nodes);
  };

  // Show buttons
  const showButtons = () => {
    setTimeout(() => {
      setShowButtonsState(true);
      if (cursorRef.current) cursorRef.current.style.display = "none";
    }, buttonsDelay);
  };
  // Skip animation
  const skipAnimation = () => {
    skipRef.current = true;
    setShowButtonsState(true);
    if (welcomeRef.current) welcomeRef.current.innerHTML = "";
    if (nameRef.current) {
      nameRef.current.innerHTML = text3;
      nameRef.current.classList.add("skipped-text");
    }
    if (motoRef.current) {
      motoRef.current.innerHTML = text4;
      motoRef.current.classList.add("skipped-text");
    }
    if (cursorRef.current) {
      cursorRef.current.style.display = "none";
    }
  };

  // Start on click
  useEffect(() => {
    const handleClick = async () => {
      if (userInteracted) return;
      setUserInteracted(true);
      setTimeout(() => setShowSkipButton(true), skipDelay);
      const audio = beepAudioRef.current;
      if (audio) {
        try {
          await audio.play();
          audio.pause();
          audio.currentTime = 0;
        } catch {}
      }

      await typeAnimation(text1, welcomeRef, "cursor1", false, false, {
        typeSpeed: 155,
        postDelay: 1500,
      });
      await typeAnimation(text2, welcomeRef, "cursor1", false, false, {
        typeSpeed: 155,
        postDelay: 2000,
      });
      await typeAnimation(text3, nameRef, "cursor2", true, false);

      await typeAnimation(text4, motoRef, "cursor3", true, true);
      if (!skipRef.current) showButtons();
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [userInteracted]);
  return (
    <>
      <div className="typing-container font-jura font-normal">
        <audio ref={beepAudioRef} src="/beep.mp3" preload="auto" />
        <div className="text-center whitespace-nowrap ">
          <span
            id="welcomeText"
            ref={welcomeRef}
            className="text-[45px]"
          ></span>
          <span
            id="Name"
            ref={nameRef}
            className="text-[80px] font font-semibold"
          ></span>
          <span id="Moto" ref={motoRef} className="text-[35px] "></span>
          <span
            id="cursor"
            ref={cursorRef}
            className={`inline-flex justify-center align-bottom
           -ml-[3px] text-gray-300 font-jura opacity-40 animate-blink ${"cursor1"}`}
          >
            |
          </span>
        </div>

        {!showButtonsState && showSkipButton && (
          <button
            onClick={skipAnimation}
            className="absolute top-4  right-6 text-[27px] text-black font-semibold
            pt-2.5 px-5 pb-2.5 mx-3 my-0
            cursor-pointer rounded-md border border-[#999]
            bg-[#DDDDDD] shadow-fancy
            transition-shadow duration-300 ease-linear
            hover:animate-move-colors"
          >
            Skip
          </button>
        )}

        {showButtonsState && (
          <div className="flex justify-center mt-10">
            <button
              className="        
            relative text-[27px] text-black font-semibold
            pt-2.5 px-5 pb-2.5 mx-3 my-0
            cursor-pointer rounded-md border border-[#999]
            bg-[#DDDDDD] shadow-fancy
            transition-shadow duration-300 ease-linear
            hover:animate-move-colors"
              onClick={falling}
            >
              Log in
            </button>
            <button
              className="
            relative text-[27px] text-black font-semibold
            pt-2.5 px-5 pb-2.5 mx-3 my-0
            cursor-pointer rounded-md border border-[#999]
            bg-[#DDDDDD] shadow-fancy
            transition-shadow duration-300 ease-linear
            hover:animate-move-colors"
              onClick={falling}
            >
              Sign up
            </button>
            <button
              onClick={falling}
              className="
            relative text-[27px] text-black font-semibold
            pt-2.5 px-5 pb-2.5 mx-3 my-0
            cursor-pointer rounded-md border border-[#999]
            bg-[#DDDDDD] shadow-fancy
            transition-shadow duration-300 ease-linear
            hover:animate-move-colors
            "
            >
              ???
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default TypingAnimation;
