import { useRef, useState } from 'react';

import Phaser from 'phaser';
import { PhaserGame } from './game/PhaserGame';
import { EventBus } from './game/EventBus';
import DialogBox from './DialogBox';

function App() {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef();
  const [showButton, setShowButton] = useState(false);
  const [dialogMessages, setDialogMessages] = useState([]);

  const triggerDialog = (messages) => {
    setDialogMessages(messages);
  };

  const closeDialog = () => {
    setDialogMessages([]);
    EventBus.emit('phaser-jsx-done');
  };

  EventBus.on('show-dialog', (currentScene, props) => {
    triggerDialog(props.msgs);
  });

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
    <div id="app" style={{ position: 'relative', margin: '0 auto'}}>
      <PhaserGame ref={phaserRef} currentActiveScene={onSceneEvent} />
      <DialogBox messages={dialogMessages} onComplete={closeDialog} />
      {showButton && (
        <button className="button" onClick={changeScene}>
          Start Game
        </button>
      )}
    </div>
  );
}

export default App;
