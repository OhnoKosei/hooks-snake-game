import React, { useCallback, useEffect, useState } from 'react'
import Navigation from './components/Navigation';
import Field from './components/Field';
import Button from './components/Button';
import MainpulationPanel from './components/ManipulationPanel';
import {
  defaultInterval,
  defaultDifficulty,
  Delta,
  Difficulty,
  Direction,
  DirectionKeyCodeMap,
  GameStatus,
  OppositeDirection,
  initialPosition,
  initialValues
} from './constants'
import { initFields, getFoodPosition } from './utils'

// const fieldSize = 35
// const initaPosition = { x: 17, y: 17 }
// const initiaValues = initFields(fieldSize, initaPosition)
// const defaultInterval = 100
// const defaultDifficulty = 3
// const Difficulty = [1000, 500, 100, 50, 10]


// const GameStatus = Object.freeze({
//   init: 'init',
//   playing: 'playing',
//   suspended: 'suspended',
//   gameover: 'gameover'
// })

// const Direction = Object.freeze({
//   up: 'up',
//   right: 'right',
//   left: 'left',
//   down: 'down'
// })
// const DirectionKeyCodeMap = Object.freeze({
//   37: Direction.left,
//   38: Direction.up,
//   39: Direction.right,
//   40: Direction.down,
// })

// const OppositeDirection = Object.freeze({
//   up: 'up',
//   right: 'right',
//   left: 'left',
//   down: 'up'
// })

// const Delta = Object.freeze({
//   up: { x: 0, y: -1 },
//   right: { x: 1, y: 0 },
//   left: { x: -1, y: 0 },
//   down: { x: 0, y: 1 },
// })
let timer = undefined

const unsubscribe = () => {
  if (!timer) {
    return
  }
  clearInterval(timer)
}

const isCollision = (fieldSize, position) => {
  if (position.y < 0 || position.x < 0) {
    return true;
  }
  if (position.y > fieldSize - 1 || position.x > fieldSize - 1) {
    return true;
  }
  return false;
};
const isEatingMyself = (fields, position) => {
  return fields[position.y][position.x] === 'snake'
}

function App() {
  const [fields, setFields] = useState(initialValues)
  const [body, setBody] = useState([])
  const [status, setStatus] = useState(GameStatus.init)
  const [direction, setDirection] = useState(Direction.up)
  const [difficulty, setDifficulty] = useState(defaultDifficulty)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setBody([initialPosition])
    // setBody(
    //   new Array(15).fill('').map((_item, index) => ({ x: 17, y: 17 + index })),
    // )
    // ゲーム中の時間を管理する
    const interval = Difficulty[difficulty - 1]
    timer = setInterval(() => {
      setTick(tick => tick + 1)
    }, interval)
    return undefined
  }, [difficulty])

  useEffect(() => {
    if (body.length === 0 || status !== GameStatus.playing) {
      return
    }
    const canContinue = handleMoving()
    if (!canContinue) {
      setStatus(GameStatus.gameover)
    }
  }, [tick])

  const onStart = () => setStatus(GameStatus.playing)
  const onStop = () => setStatus(GameStatus.suspended)
  /*
    const onRestart = () => {
      timer = setInterval(() => {
        setTick(tick => tick + 1)
      }, defaultInterval)
      setDirection(Direction.up)
      setStatus(GameStatus.init)
      setBody([initialPosition])
      setDirection(Direction.up)
      setFields(initFields(35, initialPosition))
    }
  */
  const onChangeDirection = useCallback((newDirection) => {
    if (status !== GameStatus.playing) {
      return direction
    }
    if (OppositeDirection[direction] === newDirection) {
      return
    }
    setDirection(newDirection)
  }, [direction, status])

  const onChangeDifficulty = useCallback((difficulty) => {
    if (status !== GameStatus.init) {
      return
    }
    if (difficulty < 1 || difficulty > Difficulty.length) {
      return
    }
    setDifficulty(difficulty)
  }, [status, difficulty])



  useEffect(() => {
    const handleKeyDown = (e) => {
      const newDirection = DirectionKeyCodeMap[e.keyCode];
      if (!newDirection) {
        return;
      }

      onChangeDirection(newDirection);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onChangeDirection])

  const handleMoving = () => {
    const { x, y } = body[0]
    const delta = Delta[direction]
    const newPosition = {
      x: x + delta.x,
      y: y + delta.y
    }
    if (isCollision(fields.length, newPosition) || isEatingMyself(fields, newPosition)) {
      unsubscribe()
      return false
    }
    const newBody = [...body]
    if (fields[newPosition.y][newPosition.x] !== 'food') {
      const removingTrack = newBody.pop()
      fields[removingTrack.y][removingTrack.x] = ''
    } else {
      const food = getFoodPosition(fields.length, [...newBody, newPosition])
      fields[food.y][food.x] = 'food'
    }
    fields[newPosition.y][newPosition.x] = 'snake'
    newBody.unshift(newPosition)

    setBody(newBody)
    setFields(fields)
    return true
  }
  console.log('direction', direction)
  return (
    <div className="App">
      <header className='header'>
        <div className='title-container'>
          <h1 className='title'>Snake Game</h1>
        </div>
        <Navigation
          length={body.length}
          difficulty={difficulty}
          onChangeDifficulty={onChangeDifficulty}
        />

      </header>
      <main className='main'>
        <Field fields={fields} />
      </main>

      <footer className='footer'>
        <Button
          status={status}
          onStop={onStop}
          onStart={onStart}
        // onRestart={onRestart}
        />
        <MainpulationPanel onChange={onChangeDirection} />
      </footer>

    </div >
  );
}

export default App;
