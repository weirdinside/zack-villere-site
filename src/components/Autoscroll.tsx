import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ------------------------------------ //
//                 TYPES                //
// ------------------------------------ //

interface AutoscrollTextProps {
  trigger?: boolean | number | string; // this is a value that changes to trigger the effect
  scrollSpeed?: number; // number greater than 0
  pauseTime?: number; // pause time before and after the marquee runs
  children: string; // this is where the text goes
  align?: "left" | "right" | "center"; // alignment of the text if the text doesn't exceed the parent width
}

// ------------------------------------ //
//              COMPONENT               //
// ------------------------------------ //

export default function AutoscrollText({
  children,
  trigger = true,
  scrollSpeed = 1,
  pauseTime = 500,
  align = "left",
}: AutoscrollTextProps) {
  // on page load, set style and transition: right 0px and transition to true
  // when the children change, recalculate and retrigger.

  // ------------------------------------ //
  //                STATES                //
  // ------------------------------------ //

  const [scrollTime, setScrollTime] = useState<number>(0); // stores scrollTime variable after calculation in checkWindowSize hook
  const [containerWidth, setContainerWidth] = useState<number>(0); // again, arbitrary number but tracks container width
  const [difference, setDifference] = useState<number>(0); // the int value of the pixel value to move the text
  const [textStyle, setTextStyle] = useState<React.CSSProperties>({}); // stores the states to be animated between. set on an interval
  const [hasMeasured, setHasMeasured] = useState(false); // ensures both container and text widths are known

  // ------------------------------------ //
  //                  REFS                //
  // ------------------------------------ //

  const marqueeRef = useRef<HTMLDivElement>(null); // reference for the parent container (if marquee is to be active, this is smaller)
  const textRef = useRef<HTMLParagraphElement>(null); // reference for the text container (if marquee is to be active, this is larger)
  const prevChildrenRef = useRef<string>(children);

  // ------------------------------------ //
  //               UTILITIES              //
  // ------------------------------------ //

  const intervalTime = useMemo(() => {
    return scrollTime + pauseTime * 2;
  }, [scrollTime, pauseTime]);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const setStylesSequentially = useCallback(async () => {
    setTextStyle(() => ({
      position: `absolute`,
      textWrap: `nowrap`,
      transition: `none`,
      right: `${-difference}px`,
    }));

    await delay(20);

    setTextStyle(() => ({
      position: `absolute`,
      textWrap: `nowrap`,
      transition: `${scrollTime}ms linear ${pauseTime}ms`,
      right: "0px",
    }));
  }, [setTextStyle, difference, pauseTime, scrollTime]);

  const resetText = useCallback(() => {
    setTextStyle({
      position: `absolute`,
      textWrap: `nowrap`,
      transition: `none`,
      right: `${-difference}px`,
    });
  }, [setTextStyle, difference]);

  // ------------------------------------ //
  //                 HOOKS                //
  // ------------------------------------ //

  useEffect(
    function checkWindowSize() {
      if (textRef.current && containerWidth > 0) {
        const textWidth = textRef.current.offsetWidth;
        const diff = textWidth - containerWidth;

        setScrollTime(diff * 21 * (1 / scrollSpeed));
        setDifference(diff);
        setHasMeasured(true); // confirms both widths are known
      }
    },
    [scrollSpeed, children, containerWidth]
  );

  useEffect(
    function setInitialStyle() {
      if (!hasMeasured) return;

      function getAlignmentStyle(): React.CSSProperties {
        const baseStyle = {
          position: "absolute",
          textWrap: "nowrap",
          transition: "none",
        };

        if (difference > 0) {
          return {
            ...baseStyle,
            right: `${-difference}px`,
          } as React.CSSProperties;
        }

        switch (align) {
          case "left":
            return { ...baseStyle, left: "0px" } as React.CSSProperties;
          case "right":
            return { ...baseStyle, right: "0px" } as React.CSSProperties;
          case "center":
            return {
              ...baseStyle,
              left: "0",
              right: "0",
              marginInline: "auto",
              width: "fit-content",
            } as React.CSSProperties;
        }
      }

      setTextStyle(getAlignmentStyle);
    },
    [scrollTime, pauseTime, align, difference, hasMeasured]
  );

  useEffect(
    function loopSet() {
      if (!hasMeasured || difference <= 0) return;

      let interval: ReturnType<typeof setInterval> | undefined;

      if (trigger) {
        interval = setInterval(() => {
          setStylesSequentially();
        }, intervalTime);
        setStylesSequentially();
      } else {
        clearInterval(interval);
        resetText();
      }

      return () => {
        clearInterval(interval);
      };
    },
    [
      difference,
      resetText,
      setStylesSequentially,
      trigger,
      children,
      containerWidth,
      intervalTime,
      pauseTime,
      align,
      hasMeasured,
    ]
  );

  useEffect(function detectResize() {
    const containerRef = marqueeRef.current;
    if (!containerRef) return;
    const myObserver = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    myObserver.observe(containerRef);
    return () => {
      myObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (prevChildrenRef.current !== children) {
      prevChildrenRef.current = children;
      setTextStyle({
        position: `absolute`,
        textWrap: `nowrap`,
        transition: `none`,
        right: `${-difference}px`,
      });
    }
  }, [children, difference]);

  return (
    <div
      style={{
        zIndex: "0",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        height: `min-content`,
        position: "relative",
        width: `100%`,
        overflow: "hidden",
      }}
      ref={marqueeRef}
    >
      <div
        style={{
          opacity: "0",
          margin: "0",
          padding: "0",
          whiteSpace: "nowrap",
        }}
      >
        {"x"}
      </div>
      <div style={textStyle} ref={textRef}>
        {children}
      </div>
    </div>
  );
}
