import { useEffect, useRef, useState } from "react";

export default function Modal({
  isOpen,
  onClose,
  children,
  size = "md",
}) {
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setPosition({ x: 0, y: 0 });
    setDragging(false);

    dragRef.current = {
      active: false,
      startX: 0,
      startY: 0,
      initialX: 0,
      initialY: 0,
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePointerDown = (event) => {
    if (!event.target.closest("[data-drag-handle]")) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      initialX: position.x,
      initialY: position.y,
    };

    setDragging(true);
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active) return;

    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;

    setPosition({
      x: dragRef.current.initialX + deltaX,
      y: dragRef.current.initialY + deltaY,
    });
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
    setDragging(false);
  };

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-7xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: dragging ? "none" : "transform 200ms ease",
        }}
        className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden rounded-2xl bg-[#FFFDF9] shadow-2xl`}
      >
        {children}
      </div>
    </div>
  );
}