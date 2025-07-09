import { useState, useEffect, useRef } from "react";
import styles from "./Knob.module.css";

// WHAT IS THIS COMPONENT?
// react-knob is a headless knob that allows devs to implement a range input with the UX of a knob.
// the goal is to keep the DX simple and create a controlled input that a developer can pass a state and state setter into

// developer should provide minValue and maxValue, startAngle and endAngle

export default function Knob({
  value,
  preset,
  setValue,
  startValue = 0,
  endValue = 12,
  defaultValue = startValue,
  startAngle = -180,
  endAngle = startAngle + 360,
  snap = true,
  step = 0.01,
  outline,
  indicator,
  infinite = false,
}: {
  value: number;
  setValue: (arg0: number) => void;
  startValue: number;
  endValue?: number;
  startAngle?: number;
  endAngle?: number;
  preset?: "dot knob" | "line knob";
  defaultValue?: number;
  snap?: boolean;
  step?: number;
  outline?: string;
  indicator?: string;
  infinite?: boolean;
}) {
  const [knobRotation, setKnobRotation] = useState<number>(0);
  const [rotations, setRotations] = useState<number>(0);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [windowDimensions, setWindowDimensions] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const prevAngleRef = useRef<number>(0);
  const accumulatedAngleRef = useRef(0);

  const [rotationDirection, setRotationDirection] = useState<
    "cw" | "ccw" | null
  >(null);

  const knobRef = useRef<HTMLDivElement>(null);

  // infinite roll logic:
  // if the angle is less than 180 from the endAngle (360 after normalization), overflow into the next zone
  // else, normalize back into the current zone and go below (back into the current zone or zone below)
  // so if the startAngle is 15deg and the current angle is 80deg: assuming the endAngle is 375, clicking at -79 results
  // in going to -1x261 and clicking at 260 results in 0x260

  function validateAngle() {
    // if the startAngle + 360 is >= than the endAngle, we're safe: 0-360 can be the endAngle without problems
    if (startAngle + 360 >= endAngle) return;
    else endAngle = startAngle + 360; // otherwise, we're maxed out. so set the endAngle to startAngle + 360
  }

  function clampRotation(value: number) {
    return Math.min(Math.max(value, startAngle), endAngle);
  }

  function normalizeAngle(angle: number) {
    return ((angle % 360) + 360) % 360;
  }

  function calculateDegree(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (knobRef.current) {
      const knobRect = knobRef.current.getBoundingClientRect();
      const x1 = knobRect.left + knobRect.width / 2;
      const y1 = knobRect.top + knobRect.height / 2;

      const x2 = e.clientX; // xcoord mousePos
      const y2 = e.clientY; // ycoord mousePos

      const deltaY = y1 - y2; // diff between y(center of knob - mousePos)
      const deltaX = x1 - x2; // diff between x(center of knob - mousePos)

      const rad = Math.atan2(deltaY, deltaX);

      const offset = 180 - startAngle;
      const shift = startAngle;
      const deg = ((rad * (180 / Math.PI) + 90 + offset) % 360) + shift;
      return deg;
    }
    return 0;
  }
  function handleRotate(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (isClicked && knobRef.current) {
      const newAngle = calculateDegree(e);
      const prevAngle = prevAngleRef.current;
      const delta = newAngle - prevAngle;
      const normalizedDelta = ((delta + 540) % 360) - 180;

      if (Math.abs(normalizedDelta) < 1) return;

      if (infinite) {
        const degreesPerFullRange = endAngle - startAngle;
        const unitsPerDegree = (endValue - startValue) / degreesPerFullRange;
        accumulatedAngleRef.current += normalizedDelta;

        const accumulatedValueDelta =
          accumulatedAngleRef.current * unitsPerDegree;

        if (Math.abs(accumulatedValueDelta) >= step) {
          const steps = Math.floor(Math.abs(accumulatedValueDelta) / step);
          const deltaValue = steps * step * Math.sign(accumulatedValueDelta); 
          const newValue = parseFloat((value + deltaValue).toFixed(4));

          setValue(newValue);
          const usedAngle = (step * steps) / unitsPerDegree;
          accumulatedAngleRef.current -=
            usedAngle * Math.sign(accumulatedValueDelta);
        }

        // Visual rotation
        setKnobRotation(newAngle);
      } else {
        if (newAngle > endAngle) return;
        setRotationDirection(normalizedDelta > 0 ? "cw" : "ccw");
        setKnobRotation(clampRotation(newAngle));
      }

      prevAngleRef.current = newAngle;
    }
  }

  useEffect(function readRotationOnLoad() {
    setValue(defaultValue);
  }, []);

  useEffect(() => {
    if (infinite) return;

    validateAngle();

    const normalizedRotation = normalizeAngle(knobRotation - startAngle);
    const amountRotated = normalizedRotation / (endAngle - startAngle);
    const currentValue = startValue + (endValue - startValue) * amountRotated;

    if (snap) {
      const snappedValue = parseFloat(
        (Math.round(currentValue / step) * step).toFixed(2)
      );

      setValue(snappedValue);
      setKnobRotation(
        startAngle +
          (endAngle - startAngle) *
            ((snappedValue - startValue) / (endValue - startValue))
      );
    } else {
      setValue(parseFloat((Math.round(currentValue / step) * step).toFixed(2)));
      setKnobRotation(knobRotation);
    }
  }, [knobRotation, startAngle, endAngle, infinite]);

  useEffect(
    function setPreventerDimensionsOnResize() {
      setWindowDimensions({ x: window.innerWidth, y: window.innerHeight });
    },
    [window.innerHeight, window.innerWidth]
  );

  return (
    <div
      ref={knobRef}
      onPointerDown={() => {
        setIsClicked(true);
      }}
      onPointerMove={(e) => {
        handleRotate(e);
      }}
      className={styles.knob}
    >
      <div className={styles.knob__outline} />
      <div
        style={{ rotate: `${knobRotation}deg` }}
        className={styles.knob__indicator}
      />
      <div
        onPointerUp={() => {
          setIsClicked(false);
        }}
        onPointerCancel={() => {
          setIsClicked(false);
        }}
        style={{
          zIndex: `${isClicked ? "20" : "-1"}`,
          position: "fixed",
          width: `${windowDimensions.x}px`,
          height: `${windowDimensions.y}px`,
          top: 0,
          left: 0,
        }}
        className={styles.mouseaction_preventer}
      />
    </div>
  );
}
