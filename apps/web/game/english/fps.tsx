'use client';

import { useEffect, useRef, useState } from 'react';
import type { LearningItem } from '@/lib/types';
import { db } from '@/lib/db';

export interface FPSGameProps {
  items: LearningItem[];
  onComplete: (results: { itemId: string; correct: boolean; latencyMs: number }[]) => void;
}

/**
 * 영어 단어 학습 3D FPS 게임
 * ssat-fps-game.html 참조
 */
export function FPSGame({ items, onComplete }: FPSGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [currentWord, setCurrentWord] = useState<{ word: string; meaning: string; wrong: string[] } | null>(null);
  const [results, setResults] = useState<{ itemId: string; correct: boolean; latencyMs: number }[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const gameStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!gameStarted || !containerRef.current) return;

    // Three.js 동적 로드
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      initGame();
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, currentItemIndex]);

  const initGame = () => {
    if (!containerRef.current || !(window as any).THREE) return;

    const THREE = (window as any).THREE;

    // 게임 초기화
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // 지형 생성
    const terrainSize = 200;
    const segments = 80;
    const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, segments, segments);
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 1];
      vertices[i + 2] = 
        Math.sin(x * 0.08) * Math.cos(z * 0.08) * 8 + 
        Math.sin(x * 0.2) * Math.cos(z * 0.15) * 3 +
        Math.random() * 1;
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({ 
      color: 0x3a7d44,
      roughness: 0.9,
      flatShading: true
    });
    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);

    const getTerrainHeight = (x: number, z: number) => {
      const raycaster = new THREE.Raycaster();
      raycaster.set(new THREE.Vector3(x, 50, z), new THREE.Vector3(0, -1, 0));
      const intersects = raycaster.intersectObject(terrain);
      return intersects.length > 0 ? intersects[0].point.y : 0;
    };

    // 적 생성
    const enemies: any[] = [];
    const startTime = Date.now();

    class Enemy {
      text: string;
      isCorrect: boolean;
      health: number;
      maxHealth: number;
      group: any; // THREE.Group
      body: any; // THREE.Mesh
      head: any; // THREE.Mesh
      sprite: any; // THREE.Sprite
      healthBar: any; // THREE.Sprite
      speed: number;
      hit: boolean;
      counted: boolean;

      constructor(text: string, isCorrect: boolean) {
        this.text = text;
        this.isCorrect = isCorrect;
        this.health = 100;
        this.maxHealth = 100;
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 40;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        const y = getTerrainHeight(x, z);
        
        this.group = new THREE.Group();
        
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 1.2, 0.4),
          new THREE.MeshStandardMaterial({ color: 0x9b59b6 })
        );
        body.position.y = 1.2;
        body.castShadow = true;
        body.userData.enemy = this;
        body.userData.isBody = true;
        this.body = body;
        this.group.add(body);

        const head = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 16, 16),
          new THREE.MeshStandardMaterial({ color: 0xf39c12 })
        );
        head.position.y = 2.1;
        head.castShadow = true;
        head.userData.enemy = this;
        head.userData.isHead = true;
        this.head = head;
        this.group.add(head);

        this.group.position.set(x, y, z);
        scene.add(this.group);

        this.createTextSprite();
        this.speed = 0.02;
        this.hit = false;
        this.counted = false;
      }

      createTextSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        this.sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
        this.sprite.scale.set(3, 1.5, 1);
        this.sprite.position.set(this.group.position.x, this.group.position.y + 3.5, this.group.position.z);
        scene.add(this.sprite);
      }

      takeDamage(damage: number, isHeadshot: boolean) {
        this.health -= damage;
        
        const part = isHeadshot ? this.head : this.body;
        const originalColor = part.material.color.getHex();
        part.material.color.setHex(0xff0000);
        
        setTimeout(() => {
          part.material.color.setHex(originalColor);
        }, 100);
        
        return this.health <= 0;
      }

      update() {
        if (this.hit) return;

        const direction = new THREE.Vector3();
        direction.subVectors(camera.position, this.group.position);
        direction.y = 0;
        direction.normalize();

        this.group.position.x += direction.x * this.speed;
        this.group.position.z += direction.z * this.speed;
        
        const terrainHeight = getTerrainHeight(this.group.position.x, this.group.position.z);
        this.group.position.y = terrainHeight;

        this.sprite.position.x = this.group.position.x;
        this.sprite.position.z = this.group.position.z;
        this.sprite.position.y = this.group.position.y + 3.5;

        this.group.lookAt(camera.position);
      }

      destroy(isCorrect: boolean) {
        this.hit = true;
        const color = isCorrect ? 0x00ff00 : 0xff0000;
        this.body.material.color.setHex(color);
        this.head.material.color.setHex(color);

        setTimeout(() => {
          scene.remove(this.group);
          scene.remove(this.sprite);
        }, 300);
      }
    }

    // 적 스폰
    const spawnEnemies = () => {
      enemies.forEach(e => {
        scene.remove(e.group);
        scene.remove(e.sprite);
      });
      enemies.length = 0;

      // 현재 아이템 업데이트
      const item = items[currentItemIndex];
      if (!item) return;

      const word = item.stem.type === 'text' ? item.stem.payload : '';
      const correctMeaning = item.choices?.find(c => c.id === item.answer.value)?.label || '';
      const wrongMeanings = item.choices?.filter(c => c.id !== item.answer.value).map(c => c.label).slice(0, 3) || [];
      
      setCurrentWord({
        word,
        meaning: correctMeaning,
        wrong: wrongMeanings,
      });

      // 적 스폰
      enemies.push(new Enemy(correctMeaning, true));
      wrongMeanings.forEach(w => {
        enemies.push(new Enemy(w, false));
      });
    };

    spawnEnemies();

    // 컨트롤
    let controls = { forward: false, backward: false, left: false, right: false };
    let velocity = new THREE.Vector3();
    let moveSpeed = 0.15;
    let isPointerLocked = false;
    let euler = new THREE.Euler(0, 0, 0, 'YXZ');
    let isOnGround = true;
    let jumpVelocity = 0;
    let gravity = -0.02;
    let isShooting = false;
    let lastShotTime = 0;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0);

    // 포인터 잠금
    const lockMessage = document.createElement('div');
    lockMessage.id = 'lockMessage';
    lockMessage.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,215,0,0.95); color: #1a1a2e; padding: 30px 50px; border-radius: 15px; font-size: 20px; cursor: pointer; z-index: 50;';
    lockMessage.textContent = '화면을 클릭하여 시작하세요';
    containerRef.current.appendChild(lockMessage);

    renderer.domElement.addEventListener('click', () => {
      if (gameStarted && !isPointerLocked) {
        renderer.domElement.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      isPointerLocked = document.pointerLockElement === renderer.domElement;
      lockMessage.style.display = (gameStarted && !isPointerLocked) ? 'block' : 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (isPointerLocked) {
        euler.setFromQuaternion(camera.quaternion);
        euler.y -= e.movementX * 0.001;
        euler.x -= e.movementY * 0.001;
        euler.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, euler.x));
        camera.quaternion.setFromEuler(euler);
      }
    });

    // 키보드 컨트롤
    document.addEventListener('keydown', (e) => {
      switch(e.code) {
        case 'KeyW': controls.forward = true; break;
        case 'KeyS': controls.backward = true; break;
        case 'KeyA': controls.left = true; break;
        case 'KeyD': controls.right = true; break;
        case 'Space': if (isOnGround) { jumpVelocity = 0.3; isOnGround = false; } break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch(e.code) {
        case 'KeyW': controls.forward = false; break;
        case 'KeyS': controls.backward = false; break;
        case 'KeyA': controls.left = false; break;
        case 'KeyD': controls.right = false; break;
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (gameStarted && isPointerLocked && e.button === 0) {
        isShooting = true;
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        isShooting = false;
      }
    });

    // 이동 업데이트
    const updateMovement = () => {
      const direction = new THREE.Vector3();
      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();
      
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

      if (controls.forward) direction.add(forward);
      if (controls.backward) direction.sub(forward);
      if (controls.right) direction.add(right);
      if (controls.left) direction.sub(right);

      if (direction.length() > 0) {
        direction.normalize();
        velocity.x = direction.x * moveSpeed;
        velocity.z = direction.z * moveSpeed;
      } else {
        velocity.x *= 0.9;
        velocity.z *= 0.9;
      }

      camera.position.x += velocity.x;
      camera.position.z += velocity.z;
      camera.position.x = Math.max(-95, Math.min(95, camera.position.x));
      camera.position.z = Math.max(-95, Math.min(95, camera.position.z));

      const terrainHeight = getTerrainHeight(camera.position.x, camera.position.z);
      const targetY = terrainHeight + 2.5;

      if (!isOnGround) {
        jumpVelocity += gravity;
        camera.position.y += jumpVelocity;
      }

      if (isOnGround) {
        camera.position.y += (targetY - camera.position.y) * 0.2;
      }

      if (camera.position.y <= targetY) {
        camera.position.y = targetY;
        jumpVelocity = 0;
        isOnGround = true;
      }
    };

    // 사격
    const shoot = () => {
      const now = Date.now();
      if (now - lastShotTime < 300) return;
      lastShotTime = now;

      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      
      const shootables: any[] = []; // THREE.Object3D[]
      enemies.forEach(e => {
        shootables.push(e.head, e.body);
      });
      
      const intersects = raycaster.intersectObjects(shootables);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const enemy = hit.userData.enemy as Enemy;
        const isHeadshot = hit.userData.isHead;
        const damage = isHeadshot ? 100 : 50;
        
        const isDead = enemy.takeDamage(damage, isHeadshot);
        
        if (isDead && !enemy.counted) {
          enemy.counted = true;
          const latencyMs = Date.now() - startTime;
          const currentItem = items[currentItemIndex];
          
          if (enemy.isCorrect && currentItem) {
            setCombo(prev => prev + 1);
            setScore(prev => prev + 100);
            
            const newResult = {
              itemId: currentItem.id,
              correct: true,
              latencyMs,
            };
            
            setResults(prev => {
              const updated = [...prev, newResult];
              // 다음 문제로
              setTimeout(() => {
                if (currentItemIndex + 1 < items.length) {
                  setCurrentItemIndex(prev => prev + 1);
                  // 새 웨이브 스폰
                  spawnEnemies();
                } else {
                  // 완료
                  handleCompleteWithLog(updated);
                  setGameOver(true);
                }
              }, 1000);
              return updated;
            });
            
            enemy.destroy(true);
          } else {
            const currentItem = items[currentItemIndex];
            setCombo(0);
            
            if (currentItem) {
              const newResult = {
                itemId: currentItem.id,
                correct: false,
                latencyMs,
              };
              
              setResults(prev => [...prev, newResult]);
            }
            
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setTimeout(() => {
                  setResults(current => {
                    handleCompleteWithLog(current);
                    return current;
                  });
                  setGameOver(true);
                }, 1000);
                return 0;
              }
              return newLives;
            });
            
            enemy.destroy(false);
          }
        }
      }
    };

    // 애니메이션 루프
    const animate = () => {
      if (gameOver) return;
      requestAnimationFrame(animate);

      updateMovement();
      
      if (isShooting) {
        shoot();
      }
      
      enemies.forEach(e => e.update());

      renderer.render(scene, camera);
    };

    animate();

    // 리사이즈 핸들러
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize);

    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (lockMessage.parentNode) {
        lockMessage.parentNode.removeChild(lockMessage);
      }
    };
  };

  const handleStartGame = () => {
    setGameStarted(true);
    gameStartTimeRef.current = Date.now();
  };

  const handleCompleteWithLog = async (finalResults: { itemId: string; correct: boolean; latencyMs: number }[]) => {
    // 게임 실행 시간 기록
    if (gameStartTimeRef.current) {
      const durationSec = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      await db.gameLogs.add({
        gameType: 'fps',
        subject: 'english',
        startTime: gameStartTimeRef.current,
        durationSec,
        result: {
          score,
          totalItems: items.length,
          correct: finalResults.filter((r) => r.correct).length,
          incorrect: finalResults.filter((r) => !r.correct).length,
          combo: combo,
        },
        completed: true,
      });
    }
    onComplete(finalResults);
  };

  if (!gameStarted) {
    return (
      <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50">
        <h1 className="text-6xl font-bold mb-4 text-yellow-400">⚔️ WORD STRIKE FPS ⚔️</h1>
        <div className="text-2xl mb-8 text-white">영어 단어 학습 3D 게임</div>
        <button
          onClick={handleStartGame}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800 text-white text-xl rounded-full hover:scale-105 transition-transform"
        >
          🎮 게임 시작
        </button>
        <div className="mt-8 text-center text-white max-w-2xl px-8">
          <p className="mb-2"><strong>WASD</strong> 이동 | <strong>Space</strong> 점프</p>
          <p className="mb-2"><strong>좌클릭</strong> 사격</p>
          <p className="mb-2">정답 적을 처치하면 점수 획득, 오답 적을 처치하면 생명 감소</p>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50">
        <h1 className="text-6xl font-bold mb-4 text-red-400">🎮 GAME OVER</h1>
        <div className="text-2xl mb-8 text-white">최종 점수: {score}</div>
        <button
          onClick={() => handleCompleteWithLog(results)}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xl rounded-full hover:scale-105 transition-transform"
        >
          결과 확인
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-screen" />
      
      {/* HUD */}
      <div className="absolute top-4 left-4 bg-black/80 text-white p-4 rounded-lg">
        <div>점수: {score}</div>
        <div>❤️ 생명: {lives}</div>
        {combo > 0 && <div>🔥 COMBO x{combo}</div>}
      </div>

      {/* 목표 단어 */}
      {currentWord && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400/95 text-gray-900 px-8 py-4 rounded-lg text-2xl font-bold">
          <div className="text-base mb-1">🎯 목표 단어</div>
          <div>{currentWord.word}</div>
        </div>
      )}

      {/* 크로스헤어 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
        <div className="w-8 h-8 relative">
          <div className="absolute top-1/2 left-0 w-6 h-0.5 bg-white/90 transform -translate-y-1/2"></div>
          <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-white/90 transform -translate-x-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
}

