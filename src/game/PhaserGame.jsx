import PropTypes from 'prop-types';
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';

import DialogBox from '../DialogBox';

export const PhaserGame = forwardRef(function PhaserGame ({ currentActiveScene }, ref)
{
    const game = useRef();
    const [showDialog, setShowDialog] = useState(false);
    const [dialogContent, setDialogContent] = useState(null);

    // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
    useLayoutEffect(() => {
        
        if (game.current === undefined)
        {
            game.current = StartGame("game-container");
            
            if (ref !== null)
            {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {

            if (game.current)
            {
                game.current.destroy(true);
                game.current = undefined;
            }

        }
    }, [ref]);

    useEffect(() => {
        console.log("Scene changed!")
        EventBus.on('current-scene-ready', (currentScene) => {

            if (currentActiveScene instanceof Function)
            {
                currentActiveScene(currentScene);
            }
            ref.current.scene = currentScene;
            console.log(typeof currentScene.runStateMachine);
            if (typeof currentScene.runStateMachine !== 'undefined')
                    currentScene.runStateMachine();
            
        });
        EventBus.on('show-dialog', ((currentScene, props) => {
            console.log(props);
            props = {...props, callback: () => {
                setShowDialog(false);
                currentScene.runStateMachine();
            }}
            setDialogContent(props);
            setShowDialog(true);
        }))

        return () => {
            console.log('exit..');
            EventBus.removeListener('current-scene-ready');
            EventBus.removeListener('show-dialog');
        }
        
    }, [currentActiveScene, ref])

    return (
        <>
            <div id="game-container">
            {/* {console.log(showDialog)} */}
            {showDialog && <DialogBox {...dialogContent} ></DialogBox>}
            </div>
        </>
    );

});

// Props definitions
PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func 
}
