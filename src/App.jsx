import { useRef, useState } from 'react';

import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';

function App() {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef();
  const [showButton, setShowButton] = useState(false);

  const changeScene = () => {
    const scene = phaserRef.current.scene;

    if (scene) {
      scene.changeScene();
      setShowButton(false);
    }
  };

  // Event emitted from the PhaserGame component
  const onSceneEvent = scene => {
    setShowButton(scene.scene.key === 'MainMenu');
  };

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} currentActiveScene={onSceneEvent} />
      {showButton && (
        <button className="button" onClick={changeScene}>
          Start Game
        </button>
      )}
    </div>
  );
}

export default App;
