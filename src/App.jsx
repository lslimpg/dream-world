import { useRef, useState } from 'react';

import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';

function App() {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef();

  const changeScene = () => {
    const scene = phaserRef.current.scene;

    if (scene) {
      console.log(typeof scene);
      scene.changeScene();
    }
  };

  // Event emitted from the PhaserGame component
  const onSceneEvent = scene => {
    console.log(scene.scene.key === 'Game');
  };

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} currentActiveScene={onSceneEvent} />
      <div>
        <div>
          <button className="button" onClick={changeScene}>
            Change Scene
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
