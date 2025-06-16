import { FallingItem, FallingContainer } from "../Animations/FallingContainer";
import TypingAnimation from "../Animations/TypeAnimation";
import { useState } from "react";

const Greeting_page = () => {
  const [physicsNodes, setPhysicsNodes] = useState<React.ReactNode[] | null>(
    null
  );


  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  const fallSpawns = [
    { x: x, y: y - 100 }, 
    { x: x, y: y - 100 },
    { x: x - 50, y: y - 100 },
    { x: x + 50, y: y - 100 },
  ];
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {!physicsNodes && <TypingAnimation onReadyForPhysics={setPhysicsNodes} />}
      {physicsNodes && (
        <FallingContainer
          trigger="auto"
          spawnPoint={{ x: x, y: y }}
          className="w-full h-full "
        >
          {physicsNodes.map((node, i) => (
            <FallingItem
              key={i}
              spawnPoint={fallSpawns[i] ?? undefined}
            >
              {node}
            </FallingItem>
          ))}
        </FallingContainer>
      )}
    </div>
  );
};

export default Greeting_page;
