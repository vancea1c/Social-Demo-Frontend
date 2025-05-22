import { FallingItem, FallingContainer } from "../Animations/FallingContainer";
import TypingAnimation from "../Animations/TypeAnimation";
import { useRef, useState } from "react";
const Greeting_page = () => {
  const [physicsNodes, setPhysicsNodes] = useState<React.ReactNode[] | null>(
    null
  );

  // Define one spawn point per node:
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  const fallSpawns = [
    { x: x, y: y - 100 }, // first node drops from x=100,y=-50
    { x: x, y: y - 100 },
    { x: x - 50, y: y - 100 },
    { x: x + 50, y: y - 100 },
  ];
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {/* <div className="header">
        <h1>Greeting_page</h1>
      </div>

      <div className="body">
        <button>Skip Animation</button>
      </div>

      <div className="footer">
        <button className="btn" onClick={() => navigate("/log_in")}>
          Log in
        </button>
        <button className="btn" onClick={() => navigate("/sign_up")}>
          Sign up
        </button>
      </div> */}
      {!physicsNodes && <TypingAnimation onReadyForPhysics={setPhysicsNodes} />}
      {physicsNodes && (
        <FallingContainer
          trigger="auto"
          spawnPoint={{ x: x, y: y }}
          className="w-full h-full "
        >
          {/* wrap each node in a FallingItem */}
          {physicsNodes.map((node, i) => (
            <FallingItem
              key={i}
              // if you have more nodes than spawns, fall back to the container default:
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
