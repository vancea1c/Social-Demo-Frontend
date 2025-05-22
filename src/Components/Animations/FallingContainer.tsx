// src/components/Falling.tsx
import React, {
  ReactNode,
  ReactElement,
  forwardRef,
  HTMLAttributes,
  useRef,
  useState,
  useEffect,
  RefAttributes,
} from "react";
import {
  Engine,
  Render,
  World,
  Bodies,
  Runner,
  Mouse,
  MouseConstraint,
  Body,
} from "matter-js";

//
// 1) FallingItem: forwards its ref to an absolutely‐positioned <div>
//
export interface FallingItemProps {
  children: ReactNode;
  className?: string;
  active?: boolean;
  spawnPoint?: { x: number; y: number };
}
export const FallingItem = forwardRef<HTMLDivElement, FallingItemProps>(
  ({ children, className, active }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{
        position: active ? "absolute" : "static",
        willChange: active ? "transform" : undefined,
      }}
    >
      {children}
    </div>
  )
);
FallingItem.displayName = "FallingItem";

//
// 2) We declare our container’s children to be ONLY these FallingItems.
//    That way TS never worries about strings, DOM nodes, or other components.
//
export interface FallingContainerProps extends HTMLAttributes<HTMLDivElement> {
  trigger?: "auto" | "click" | "hover";
  children: ReactElement<FallingItemProps>[];
  spawnPoint?: { x: number; y: number };
}

export const FallingContainer: React.FC<FallingContainerProps> = ({
  trigger = "click",
  spawnPoint,
  children,
  className,
  style,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(trigger === "auto");
  const itemEls = useRef<Array<HTMLDivElement | null>>([]);

  // Now, children is already typed as ReactElement<FallingItemProps, typeof FallingItem>,
  // so cloneElement with a ref works without extra overload gymnastics:
  const itemsWithRefs = children.map((child, idx) =>
    // child is guaranteed to be a FallingItem element
    React.cloneElement(child, {
      key: `falling-item-${idx}`,
      active: true,
      ref(el: HTMLDivElement | null) {
        itemEls.current[idx] = el;
      },
    } as Partial<FallingItemProps> & RefAttributes<HTMLDivElement>)
  );

  useEffect(() => {
    if (!started || !containerRef.current || !canvasRef.current) return;

    // — Matter.js setup
    const engine = Engine.create();
    engine.world.gravity.y = 2;
    const bounds = containerRef.current.getBoundingClientRect();
    const defaultX = spawnPoint?.x ?? bounds.width / 2;
    const defaultY = spawnPoint?.y ?? -50;
    const render = Render.create({
      element: canvasRef.current,
      engine,
      options: {
        width: bounds.width,
        height: bounds.height,
        background: "transparent",
        wireframes: false,
      },
    });

    // static walls
    const wallOpts = { isStatic: true, render: { visible: false } };
    const floor = Bodies.rectangle(
      bounds.width / 2,
      bounds.height + 50,
      bounds.width,
      100,
      wallOpts
    );
    const left = Bodies.rectangle(
      -50,
      bounds.height / 2,
      100,
      bounds.height,
      wallOpts
    );
    const right = Bodies.rectangle(
      bounds.width + 50,
      bounds.height / 2,
      100,
      bounds.height,
      wallOpts
    );
    const ceiling = Bodies.rectangle(
      bounds.width / 2,
      -50,
      bounds.width,
      100,
      wallOpts
    );
    World.add(engine.world, [floor, left, right, ceiling]);
    const sx = spawnPoint?.x ?? bounds.width / 2;
    const sy = spawnPoint?.y ?? -50;
    // create bodies for each item
    const bodies: Array<{
      el: HTMLDivElement;
      body: Body;
      hw: number;
      hh: number;
    }> = [];
    itemEls.current.forEach((el, i) => {
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      const hw = width / 2;
      const hh = height / 2;

      //create a body
      const b = Bodies.rectangle(0, 0, width, height, {
        restitution: 0.8,
        frictionAir: 0,
        render: { visible: false },
      });
      const childProps = children[i].props as FallingItemProps;
      const sx = childProps.spawnPoint?.x ?? defaultX;
      const sy = childProps.spawnPoint?.y ?? defaultY;
      // move the body to the element's start position
      Body.setPosition(b, { x: sx, y: sy });
      World.add(engine.world, b);
      bodies.push({ el, body: b, hw, hh });
    });

    // mouse dragging
    const mouse = Mouse.create(containerRef.current);
    const mc = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2 },
    });
    World.add(engine.world, mc);

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // sync loop
    (function update() {
      bodies.forEach(({ el, body, hw, hh }, i) => {
        el.style.transform = `
        translate(${body.position.x - hw}px, ${body.position.y - hh}px)
        rotate(${body.angle}rad)
        `;
      });
      requestAnimationFrame(update);
    })();

    // cleanup
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
      if (canvasRef.current) canvasRef.current.innerHTML = "";
    };
  }, [started, spawnPoint]);

  // trigger handlers
  const handlers: Record<string, () => void> = {};
  if (trigger === "click") handlers.onClick = () => setStarted(true);
  if (trigger === "hover") handlers.onMouseEnter = () => setStarted(true);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ position: "relative", ...style }}
      {...handlers}
      {...rest}
    >
      {/* 1) physics layer (invisible now) */}
      <div
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0, visibility: started ? "visible" : "hidden" }}
      />

      {/* 2) your real FallingItem divs, which will sit above z-index 0 */}
      {started ? itemsWithRefs : children}
    </div>
  );
};
