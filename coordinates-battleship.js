ReactDOM.render(React.createElement(CoordinatesBattleship), document.getElementById("root"));
// coordinates-battleship.js
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CoordinatesBattleship = () => {
  const GRID_SIZE = 10;
  const COLORS = {
    island: 'rgb(212, 195, 143)',
    sea: 'rgb(190, 229, 255)',
    navy: '#253764'
  };
  const SHIP_SIZES = [
    { size: 5, name: 'Lentotukialus' },
    { size: 4, name: 'Taistelulaiva' },
    { size: 3, name: 'Risteilijä' },
    { size: 3, name: 'Risteilijä' },
    { size: 2, name: 'Hävittäjä' }
  ];
  const ISLANDS = [
    { x: 2, y: 3 }, { x: 2, y: 4 }, { x: 3, y: 3 },
    { x: 7, y: 7 }, { x: 7, y: 8 }, { x: 8, y: 7 }
  ];

  const toCoordinates = (x, y) => {
    const lat = 60 + 25/60 - (y * 5/60);
    const lon = 21 + 55/60 + (x * 5/60);
    return {
      lat: `${Math.floor(lat)}°${((lat % 1) * 60).toFixed(0)}'N`,
      lon: `${Math.floor(lon)}°${((lon % 1) * 60).toFixed(0)}'E`
    };
  };

  const [gameState, setGameState] = useState({
    ships: [],
    shots: [],
    hits: [],
    gameStarted: false,
    selectedCell: null,
    shipStatus: []
  });

  const placeShips = () => {
    const ships = [];
    const occupied = new Set(ISLANDS.map(i => `${i.x},${i.y}`));

    for (const {size, name} of SHIP_SIZES) {
      let placed = false;
      while (!placed) {
        const horizontal = Math.random() < 0.5;
        const x = Math.floor(Math.random() * (horizontal ? GRID_SIZE - size + 1 : GRID_SIZE));
        const y = Math.floor(Math.random() * (horizontal ? GRID_SIZE : GRID_SIZE - size + 1));
        
        let valid = true;
        const positions = [];
        for (let i = 0; i < size; i++) {
          const pos = {
            x: x + (horizontal ? i : 0),
            y: y + (horizontal ? 0 : i)
          };
          const key = `${pos.x},${pos.y}`;
          if (occupied.has(key)) {
            valid = false;
            break;
          }
          positions.push(pos);
        }
        
        if (valid) {
          ships.push({ positions, size, name });
          positions.forEach(pos => occupied.add(`${pos.x},${pos.y}`));
          placed = true;
        }
      }
    }
    return ships;
  };

  const startGame = () => {
    const ships = placeShips();
    setGameState({
      ships,
      shots: [],
      hits: [],
      gameStarted: true,
      selectedCell: null,
      shipStatus: ships.map(ship => ({
        ...ship,
        hits: 0
      }))
    });
  };

  const isShipDestroyed = (shipIndex) => {
    return gameState.shipStatus[shipIndex]?.hits === gameState.shipStatus[shipIndex]?.size;
  };

  const handleCellSelect = (x, y) => {
    if (!gameState.gameStarted) return;
    
    if (gameState.shots.some(shot => shot.x === x && shot.y === y)) return;
    
    setGameState(prev => ({
      ...prev,
      selectedCell: { x, y }
    }));
  };

  const handleShot = () => {
    if (!gameState.selectedCell || !gameState.gameStarted) return;
    const { x, y } = gameState.selectedCell;
    
    if (gameState.shots.some(shot => shot.x === x && shot.y === y)) {
      return;
    }

    const newShots = [...gameState.shots, { x, y }];
    let hitShipIndex = -1;
    
    gameState.ships.forEach((ship, index) => {
      if (ship.positions.some(pos => pos.x === x && pos.y === y)) {
        hitShipIndex = index;
      }
    });

    const newHits = hitShipIndex >= 0 ? [...gameState.hits, { x, y }] : gameState.hits;
    
    const newShipStatus = [...gameState.shipStatus];
    if (hitShipIndex >= 0) {
      newShipStatus[hitShipIndex] = {
        ...newShipStatus[hitShipIndex],
        hits: newShipStatus[hitShipIndex].hits + 1
      };
    }

    setGameState(prev => ({
      ...prev,
      shots: newShots,
      hits: newHits,
      shipStatus: newShipStatus,
      selectedCell: null
    }));
  };

  const renderCell = (x, y) => {
    const coords = toCoordinates(x, y);
    const isIsland = ISLANDS.some(i => i.x === x && i.y === y);
    const isShot = gameState.shots.some(shot => shot.x === x && shot.y === y);
    const isHit = gameState.hits.some(hit => hit.x === x && hit.y === y);
    const isSelected = gameState.selectedCell?.x === x && gameState.selectedCell?.y === y;
    
    let className = "w-full aspect-square border flex items-center justify-center relative ";
    if (isIsland) {
      className += "cursor-not-allowed";
    } else if (isShot) {
      className += isHit ? "bg-red-200 cursor-default " : "bg-gray-200 cursor-default ";
    } else {
      className += "cursor-pointer ";
      if (isSelected) {
        className += "bg-yellow-200 ";
      } else {
        className += "hover:bg-blue-100 ";
      }
    }

    return (
      <div 
        key={`${x}-${y}`} 
        className={className}
        onClick={() => !isIsland && !isShot && handleCellSelect(x, y)}
        style={{
          backgroundColor: isIsland ? COLORS.island : 
                          isShot ? (isHit ? "rgb(254, 202, 202)" : "rgb(229, 231, 235)") :
                          isSelected ? "rgb(254, 240, 138)" : COLORS.sea
        }}
      >
        {isShot && (
          <div className="text-2xl">
            {isHit ? "🎯" : "💨"}
          </div>
        )}
        {isSelected && (
          <div className="absolute -top-8 bg-black text-white p-1 rounded text-xs whitespace-nowrap">
            {coords.lat}, {coords.lon}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="bg-gradient-to-r from-white to-[#253764]">
        <CardTitle className="flex justify-between items-center">
          <span style={{ color: COLORS.navy }}>Laivanupotus koordinaateilla</span>
          <Button 
            onClick={startGame}
            className="bg-[#253764] hover:bg-[#324b85]"
          >
            {gameState.gameStarted ? "Uusi peli" : "Aloita peli"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="w-full grid grid-cols-10 gap-0">
            {Array.from({ length: GRID_SIZE }).map((_, y) =>
              Array.from({ length: GRID_SIZE }).map((_, x) => renderCell(x, y))
            )}
          </div>
          {gameState.selectedCell && (
            <Button 
              onClick={handleShot}
              className="bg-[#253764] hover:bg-[#324b85]"
            >
              Ammu valittuun ruutuun
            </Button>
          )}
          <div className="text-sm space-y-2">
            <p style={{ color: COLORS.navy }}>
              <span style={{ color: COLORS.island }}>⬤</span> Saaret | 🎯 Osuma | 💨 Huti
            </p>
            {gameState.gameStarted && (
              <div className="mt-4">
                <p className="font-bold mb-2" style={{ color: COLORS.navy }}>Laivojen tila:</p>
                {gameState.shipStatus.map((ship, index) => (
                  <div key={index} className="flex justify-between" style={{ color: COLORS.navy }}>
                    <span>{ship.name} ({ship.size} ruutua)</span>
                    <span>
                      {isShipDestroyed(index) 
                        ? "Tuhottu! 💥" 
                        : `Osumat: ${ship.hits}/${ship.size}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoordinatesBattleship;
