// File: src/components/FloatingAi.tsx
import { useState, useRef, useEffect } from "react";
import AiAssistant from "./AiAssistant"; // Pastikan path-nya benar ya Bos

export default function FloatingAi() {
  const [aiPos, setAiPos] = useState({ x: 0, y: 0 });
  const aiPosRef = useRef({ x: 0, y: 0 });
  const [isDraggingState, setIsDraggingState] = useState(false);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  const handleAiMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("input") || target.closest("textarea")) return;

    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: aiPosRef.current.x,
      startY: aiPosRef.current.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - dragStart.current.mouseX;
      const deltaY = e.clientY - dragStart.current.mouseY;

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        hasMoved.current = true;
        setIsDraggingState(true);
      }

      if (hasMoved.current) {
        const newX = dragStart.current.startX + deltaX;
        const newY = dragStart.current.startY + deltaY;

        aiPosRef.current = { x: newX, y: newY };
        setAiPos({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        setTimeout(() => {
          setIsDraggingState(false);
        }, 10);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      onMouseDown={handleAiMouseDown}
      onDragStart={(e) => e.preventDefault()}
      onClickCapture={(e) => {
        if (hasMoved.current) {
          e.stopPropagation();
          e.preventDefault();
        }
      }}
      style={{
        position: "fixed",
        right: "0",
        bottom: "0",
        zIndex: 99999, // ✨ Z-index Dewa agar selalu di atas Kasir & Gudang
        transform: `translate(${aiPos.x}px, ${aiPos.y}px)`,
        cursor: isDraggingState ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div style={{ pointerEvents: isDraggingState ? "none" : "auto" }}>
        <AiAssistant />
      </div>
    </div>
  );
}
