import React, { useRef, useEffect, useState } from 'react';

export default function GameCanvas({ onShotComplete, difficulty = 'easy' }) {
  const canvasRef = useRef(null);
  
  // Game state
  const state = useRef({
      ball: {
      x: 0,
      y: 0,
      baseY: 0,
      altitude: 0,
      radius: 40,
      vx: 0,
      vBaseY: 0,
      vAltitude: 0,
      scale: 1,
      alpha: 1, // Added alpha for fade-out effect on missed/high shots
      isFlying: false,
      spin: 0,
    },
    goal: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      lineY: 0
    },
    gk: {
      x: 0,
      y: 0,
      altitude: 0, // Added altitude for jumping
      vAltitude: 0,
      hasJumped: false, // Added to ensure single jump
      width: 90, // Balanced goalkeeper width (reduced from 105 for a wider target)
      height: 125, // Balanced goalkeeper height
      speed: 1.8, 
      state: 'idle', // 'idle', 'jumping', 'sliding'
      flip: false, 
    },
    swipe: {
      isDragging: false,
      pts: [], // array of {x, y, time}
    },
    slowMotion: false,
    result: null // 'goal' or 'save' or 'miss'
  });

  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Load GK images
    const gkImage = new Image();
    gkImage.src = './Human.webp';

    const gkImageIdle = new Image();
    gkImageIdle.src = './Idle.webp';

    const gkImageJump = new Image();
    gkImageJump.src = './Jumping.webp';

    const gkImageSlide = new Image();
    gkImageSlide.src = './Sliding.webp';

    // Load Ball image
    const ballImage = new Image();
    ballImage.src = './BALL.webp';

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reset ball position if not flying
      if (!state.current.ball.isFlying) {
        state.current.ball.x = canvas.width / 2;
        state.current.ball.baseY = canvas.height - 150;
        state.current.ball.altitude = 0;
        state.current.ball.scale = 1;
      }
      
      // Goal dimensions (Balanced size for satisfying gameplay on mobile)
      state.current.goal.width = Math.min(canvas.width * 0.75, 460);
      state.current.goal.height = 200;
      state.current.goal.x = canvas.width / 2;
      state.current.goal.y = canvas.height * 0.35; // Lowered goal to be closer to center of screen
      state.current.goal.lineY = state.current.goal.y + state.current.goal.height;
      
      // Reset GK
      if (!state.current.ball.isFlying) {
        state.current.gk.x = canvas.width / 2;
        state.current.gk.y = state.current.goal.lineY - state.current.gk.height;
      }
    };
    
    window.addEventListener('resize', resize);
    resize();

    const drawGoal = (ctx, goal) => {
      ctx.save();
      // Goal posts
      ctx.strokeStyle = '#e3e2e0'; // tertiary-fixed
      ctx.lineWidth = 8;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
      
      const leftX = goal.x - goal.width / 2;
      const rightX = goal.x + goal.width / 2;
      const topY = goal.y;
      const bottomY = goal.lineY;

      // Draw shadow/glow
      ctx.shadowColor = 'rgba(227,226,224,0.3)';
      ctx.shadowBlur = 20;

      // Posts and crossbar
      ctx.beginPath();
      ctx.moveTo(leftX, bottomY);
      ctx.lineTo(leftX, topY);
      ctx.lineTo(rightX, topY);
      ctx.lineTo(rightX, bottomY);
      ctx.stroke();

      // Goal Net (perspective)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      
      // Horizontal net lines
      for(let i=1; i<=10; i++) {
        const y = topY + (bottomY - topY) * (i/10);
        ctx.beginPath();
        // Perspective curve
        ctx.moveTo(leftX + (i*2), y);
        ctx.quadraticCurveTo(goal.x, y - 20, rightX - (i*2), y);
        ctx.stroke();
      }
      // Vertical net lines
      for(let i=1; i<=20; i++) {
        const x = leftX + (goal.width) * (i/21);
        ctx.beginPath();
        ctx.moveTo(x, topY);
        // Perspective inward
        const targetX = goal.x + (x - goal.x) * 0.8;
        ctx.lineTo(targetX, bottomY - 10);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawGK = (ctx, gk) => {
      let img = gkImageIdle;
      let drawWidth = gk.width;
      let drawHeight = gk.height;
      let drawX = gk.x - drawWidth / 2;
      let drawY = gk.y - gk.altitude;

      if (gk.state === 'jumping' && gkImageJump.complete) {
        img = gkImageJump;
      } else if (gk.state === 'sliding' && gkImageSlide.complete) {
        img = gkImageSlide;
        drawWidth = 145; // Wider for sliding
        drawHeight = 85; // Shorter for sliding
        drawX = gk.x - drawWidth / 2;
        const groundY = gk.y + gk.height;
        drawY = groundY - drawHeight - gk.altitude;
      } else if (gkImageIdle.complete) {
        img = gkImageIdle;
      } else {
        img = gkImage; // Fallback to legacy Human.webp
      }

      if (!img || !img.complete) return;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 15;
      
      // Draw shadow for jumping GK
      if (gk.altitude > 0) {
        ctx.beginPath();
        const shadowWidth = drawWidth * 0.6;
        ctx.ellipse(gk.x, gk.y + gk.height - 10, shadowWidth, gk.width * 0.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.max(0.1, 0.4 - gk.altitude * 0.005)})`;
        ctx.fill();
      }

      if (gk.flip) {
        // Flip horizontally around the goalkeeper's center X
        ctx.translate(gk.x, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, -drawWidth / 2, drawY, drawWidth, drawHeight);
      } else {
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      }
      ctx.restore();
    };

    const drawBall = (ctx, ball) => {
      ctx.save();
      const currentRadius = ball.radius * ball.scale;
      
      const screenY = ball.baseY - ball.altitude;
      const shadowY = ball.baseY + currentRadius * 0.5;

      // Drop shadow scaling with height
      const shadowScale = Math.max(0.2, 1 - (ball.altitude / 300));
      const shadowAlpha = Math.max(0.1, ball.scale * 0.5 * shadowScale) * ball.alpha;
      
      ctx.globalAlpha = ball.alpha; // Apply alpha to the entire ball rendering
      
      ctx.beginPath();
      ctx.ellipse(ball.x, shadowY, currentRadius * 0.8 * shadowScale, currentRadius * 0.3 * shadowScale, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
      ctx.filter = `blur(${10 + (1-shadowScale)*20}px)`;
      ctx.fill();
      ctx.filter = 'none';

      // Custom ball rendering
      if (ballImage.complete) {
        ctx.translate(ball.x, screenY);
        // Simulate rolling by rotating context
        const rollAngle = (ball.baseY) * 0.05; 
        const spinAngle = ball.x * 0.02;
        ctx.rotate(spinAngle + rollAngle);
        
        ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
        ctx.shadowBlur = 10 * ball.scale;
        
        ctx.drawImage(ballImage, -currentRadius, -currentRadius, currentRadius * 2, currentRadius * 2);
      } else {
        // Fallback procedural ball
        ctx.beginPath();
        ctx.arc(ball.x, screenY, currentRadius, 0, Math.PI * 2);
        
        const grad = ctx.createRadialGradient(
          ball.x - currentRadius*0.3, screenY - currentRadius*0.3, currentRadius*0.1,
          ball.x, screenY, currentRadius
        );
        grad.addColorStop(0, '#fff6df');
        grad.addColorStop(0.3, '#ffd700');
        grad.addColorStop(0.8, '#e9c400');
        grad.addColorStop(1, '#705e00');
        
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
        ctx.shadowBlur = 20 * ball.scale;
        ctx.fill();
      }

      ctx.restore();
      ctx.globalAlpha = 1.0; // Reset global alpha
    };

    // drawTrajectory removed as requested for a cleaner, professional mini-game look

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw atmospheric stadium lights on canvas
      ctx.save();
      const lightGrad = ctx.createRadialGradient(canvas.width/2, 100, 50, canvas.width/2, 200, 600);
      lightGrad.addColorStop(0, 'rgba(255, 246, 223, 0.15)');
      lightGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0,0, canvas.width, canvas.height);
      ctx.restore();

      // Render background vignette and stadium lights
      drawGoal(ctx, state.current.goal);
      drawGK(ctx, state.current.gk);
      
      const st = state.current;

      // Physics update
      if (st.ball.isFlying && !st.result) {
        // Slow motion near goal
        const timeScale = st.slowMotion ? 0.3 : 1;
        
        // Apply Magnus effect (curve) to horizontal velocity (scaled by canvas width for perfect responsiveness on mobile!)
        st.ball.vx += st.ball.spin * (canvas.width * 0.0013) * timeScale;
        
        // Update positions
        st.ball.x += st.ball.vx * timeScale;
        st.ball.baseY += st.ball.vBaseY * timeScale; // Moves "into" the screen
        
        // Gravity effect on altitude (creates a beautiful rising and dipping parabolic arc)
        st.ball.vAltitude -= 0.38 * timeScale; // Balanced gravity decay
        st.ball.altitude += st.ball.vAltitude * timeScale;
        
        // Bounce off the ground (slower, softer bounce on grass so it doesn't balloon back up)
        if (st.ball.altitude < 0) {
          st.ball.altitude = 0;
          st.ball.vAltitude = Math.abs(st.ball.vAltitude) * 0.12; // Grass dampening (reduced from 0.4)
        }
        
        // Perspective scaling
        const startY = canvas.height - 150;
        const travelDistance = startY - st.goal.lineY;
        const currentTravel = startY - st.ball.baseY;
        const travelRatio = Math.max(0, currentTravel / travelDistance);
        
        st.ball.scale = Math.max(0.18, 1 - (travelRatio * 0.78));
        st.ball.alpha = 1.0;

        // AI Goalkeeper Logic
        // Move towards the ball's predicted X, but limit speed
        const gkTargetX = st.ball.x;
        const gkDist = gkTargetX - st.gk.x;
        
        let speedMultiplier = 1.0;
        let reachMultiplier = 1.0;
        
        if (difficulty === 'normal') {
          speedMultiplier = 1.3;
          reachMultiplier = 1.2;
        } else if (difficulty === 'hard') {
          speedMultiplier = 2.0;
          reachMultiplier = 1.8;
        }

        // Ensure GK stays within goal posts
        const leftLimit = st.goal.x - st.goal.width/2 + st.gk.width/2;
        const rightLimit = st.goal.x + st.goal.width/2 - st.gk.width/2;

        if (Math.abs(gkDist) > 5) {
          st.gk.x += Math.sign(gkDist) * Math.min(Math.abs(gkDist), st.gk.speed * speedMultiplier * timeScale);
        }
        st.gk.x = Math.max(leftLimit, Math.min(rightLimit, st.gk.x));

        // GK Jump Logic - Jump ONLY ONCE and ONLY if ball is predicted to be high
        const distanceToGoal = st.ball.baseY - st.goal.lineY;
        if (distanceToGoal < 300 && distanceToGoal > 0 && !st.gk.hasJumped) {
            const timeToGoal = distanceToGoal / Math.max(0.1, Math.abs(st.ball.vBaseY));
            const predictedAltitude = st.ball.altitude + (st.ball.vAltitude * timeToGoal) - (0.5 * 0.38 * timeToGoal * timeToGoal);
            
            if (predictedAltitude > 100) {
                st.gk.vAltitude = 9.0; // Jump to reach high ball
                st.gk.hasJumped = true;
            } else if (distanceToGoal < 150) {
                st.gk.hasJumped = true; // Decided not to jump for low ball
            }
        }

        // Determine GK animation state and direction flip (updated dynamically in flight)
        if (st.gk.altitude > 0 || st.gk.vAltitude > 0) {
          st.gk.state = 'jumping';
          st.gk.flip = false;
        } else {
          // GK slides/dives if ball is close horizontally to the goal line, low altitude, and GK is stretching to reach it
          if (distanceToGoal < 280 && distanceToGoal > -50) {
            const gkDistX = st.ball.x - st.gk.x;
            if (Math.abs(gkDistX) > 20 && st.ball.altitude < 120) {
              st.gk.state = 'sliding';
              st.gk.flip = (gkDistX > 0); // Assuming sliding image naturally faces LEFT. Flip if diving RIGHT.
            } else {
              st.gk.state = 'idle';
              st.gk.flip = false;
            }
          } else {
            st.gk.state = 'idle';
            st.gk.flip = false;
          }
        }

        // Goal & Save detection
        if (st.ball.baseY <= st.goal.lineY) {
          const leftX = st.goal.x - st.goal.width/2;
          const rightX = st.goal.x + st.goal.width/2;
          
          // Check collision with GK
          const hitGkX = Math.abs(st.ball.x - st.gk.x) < ((st.gk.width/2 + st.ball.radius*st.ball.scale) * reachMultiplier);
          // Hit detection considers GK's current altitude
          const hitGkY = st.ball.altitude > (st.gk.altitude - 10 * reachMultiplier) && st.ball.altitude < (st.gk.altitude + st.gk.height + 20 * reachMultiplier);

          if (hitGkX && hitGkY) {
            // SAVED!
            st.result = 'save';
            st.ball.vBaseY = Math.abs(st.ball.vBaseY) * 0.3; // Bounce back
            st.ball.vAltitude = 5;
            onShotComplete('save');
            
            setTimeout(() => {
              resetBall(st, canvas);
            }, 2000);

          } else if (st.ball.x > leftX && st.ball.x < rightX && st.ball.altitude < st.goal.height) {
            // GOAL! (Strict check: ball altitude must be strictly below crossbar/goal.height)
            st.slowMotion = true;
            st.result = 'goal';
            
            // Instantly apply net collision physics! (dampen speed, start dropping immediately)
            st.ball.vBaseY = -0.5; // Stop moving deep into screen
            st.ball.vx *= 0.15;    // Drastically slow down sideways movement
            st.ball.vAltitude = -1.5; // Drop down straight into the net
            
            onShotComplete('goal');
            
            setTimeout(() => {
              resetBall(st, canvas);
            }, 2500); 
          } else {
            // MISS!
            st.result = 'miss';
            onShotComplete('miss');
            
            setTimeout(() => {
              resetBall(st, canvas);
            }, 2000);
          }
        }
      } else if (st.result) {
        if (st.result === 'miss') {
          // MISS PHYSICS: Keep flying away, getting smaller and smaller, and fading out
          st.ball.x += st.ball.vx;
          st.ball.baseY += st.ball.vBaseY;
          st.ball.altitude += st.ball.vAltitude;
          
          st.ball.vAltitude -= 0.38; // Normal gravity effect

          const startY = canvas.height - 150;
          const travelDistance = startY - st.goal.lineY;
          const currentTravel = startY - st.ball.baseY;
          const travelRatio = Math.max(1.0, currentTravel / travelDistance);

          // Get the base scale at the goal line (approx 1 - 0.78 = 0.22)
          const baseScale = 1 - 0.78; 
          st.ball.scale = Math.max(0, baseScale * Math.max(0, 1 - (travelRatio - 1.0) * 1.5));
          st.ball.alpha = Math.max(0, 1 - (travelRatio - 1.0) * 2.0);
        } else {
          // Goal net dampening or Saved bounce
          const decay = st.result === 'goal' ? 0.3 : 0.5; 
          st.ball.x += st.ball.vx * decay;
          st.ball.baseY += st.ball.vBaseY * decay;
          st.ball.vAltitude -= 0.5; // Gravity pull
          st.ball.altitude += st.ball.vAltitude;
          
          // Bounce on the grass inside the net or ground
          if (st.ball.altitude < 0) {
             st.ball.altitude = 0;
             st.ball.vAltitude = Math.abs(st.ball.vAltitude) * 0.12; 
             st.ball.vx *= 0.65; 
             st.ball.vBaseY *= 0.65;
          }
        }
      }

      // Apply GK jump physics (always run even after result, so GK lands safely on the ground)
      if (st.ball.isFlying && (st.gk.altitude > 0 || st.gk.vAltitude !== 0)) {
        const timeScale = st.slowMotion ? 0.3 : 1;
        st.gk.altitude += st.gk.vAltitude * timeScale;
        st.gk.vAltitude -= 0.6 * timeScale; // Gravity for GK
        
        if (st.gk.altitude < 0) {
            st.gk.altitude = 0;
            st.gk.vAltitude = 0;
            // Always return to idle state upon landing
            st.gk.state = 'idle';
            st.gk.flip = false;
        }
      }

      drawBall(ctx, st.ball);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onShotComplete]);

  const resetBall = (st, canvas) => {
    st.ball.isFlying = false;
    st.ball.x = canvas.width / 2;
    st.ball.baseY = canvas.height - 150;
    st.ball.altitude = 0;
    st.ball.scale = 1;
    st.ball.alpha = 1.0;
    st.ball.vx = 0;
    st.ball.vBaseY = 0;
    st.ball.vAltitude = 0;
    st.ball.spin = 0;
    st.slowMotion = false;
    st.result = null;
    st.gk.x = canvas.width / 2;
    st.gk.altitude = 0;
    st.gk.vAltitude = 0;
    st.gk.hasJumped = false;
    st.gk.state = 'idle';
    st.gk.flip = false;
  };

  // Input Handlers
  const handlePointerDown = (e) => {
    e.preventDefault(); 
    if (state.current.ball.isFlying) return;
    
    setHintVisible(false);
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const screenY = state.current.ball.baseY - state.current.ball.altitude;
    const dx = clientX - state.current.ball.x;
    const dy = clientY - screenY;
    if (Math.sqrt(dx*dx + dy*dy) < state.current.ball.radius * 3) {
      state.current.swipe.isDragging = true;
      state.current.swipe.pts = [{ x: clientX, y: clientY, time: Date.now() }];
    }
  };

  const handlePointerMove = (e) => {
    e.preventDefault();
    if (!state.current.swipe.isDragging) return;
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // KEEP ALL POINTS (Removed array shifting to capture the full visual curve from start to end of swipe!)
    state.current.swipe.pts.push({ x: clientX, y: clientY, time: Date.now() });
  };

  const handlePointerUp = (e) => {
    if (!state.current.swipe.isDragging) return;
    state.current.swipe.isDragging = false;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasWidth = canvas.width;

    const pts = state.current.swipe.pts;
    if (pts.length < 2) return;
    
    const startPt = pts[0];
    const endPt = pts[pts.length - 1];
    
    const dx = endPt.x - startPt.x;
    const dy = endPt.y - startPt.y;
    
    // Only shoot if swiped UP
    if (dy > -20) return; 

    // Calculate swipe velocity (pixels per ms)
    const duration = Math.max(10, endPt.time - startPt.time);
    const swipeSpeed = Math.abs(dy) / duration; // pixels/ms
    
    // ARCADE PHYSICS: Purely distance-based velocity, but scale speed limit for extremely fast/hard swipes
    let maxSpeedY = -6.5;
    let altitudeMult = 1.85;
    
    if (swipeSpeed > 2.0 && Math.abs(dy) > 200) {
      // Scale maxSpeedY up to -9.0 for fast swipes
      maxSpeedY = -6.5 - Math.min(2.5, (swipeSpeed - 2.0) * 1.5);
      // Scale up the altitude multiplier so the ball easily flies over the crossbar
      altitudeMult = 1.85 + Math.min(0.5, (swipeSpeed - 2.0) * 0.3);
    }
    
    const speedY = Math.max(maxSpeedY, Math.min(-3.5, dy * 0.022));

    // 1. Initial Direction: Make the ball follow the actual swipe path
    // We look at the first ~30% of the swipe to determine the initial launch angle
    let thirdIndex = Math.floor(pts.length / 3);
    if (thirdIndex < 1) thirdIndex = 1;
    if (thirdIndex >= pts.length) thirdIndex = pts.length - 1;
    
    const thirdPt = pts[thirdIndex];
    const initialDx = thirdPt.x - startPt.x;
    const initialDy = thirdPt.y - startPt.y;
    
    let projectedDx = dx;
    if (initialDy < -5) {
      projectedDx = initialDx * (dy / initialDy);
    }
    projectedDx = Math.max(-canvasWidth, Math.min(canvasWidth, projectedDx));
    const speedX = projectedDx * 0.035; 

    // 2. Curve (Spin): Based on the maximum deviation from a straight line
    let maxDeviation = 0;
    if (pts.length >= 3) {
      for (let i = 1; i < pts.length - 1; i++) {
        const pt = pts[i];
        const t = (pt.y - startPt.y) / dy;
        const lineX = startPt.x + t * dx;
        const deviation = pt.x - lineX; // Positive if swipe bulges right, negative if left
        
        if (Math.abs(deviation) > Math.abs(maxDeviation)) {
          maxDeviation = deviation;
        }
      }
    }
    
    const normalizedDev = maxDeviation / canvasWidth;
    // If deviation is positive (bulges right, `)` shape), curve left (negative spin).
    // If deviation is negative (bulges left, `(` shape), curve right (positive spin).
    let spin = -normalizedDev * 12.0; 
    spin = Math.max(-1.2, Math.min(1.2, spin)); 
    
    state.current.ball.isFlying = true;
    state.current.ball.vx = speedX;
    state.current.ball.vBaseY = speedY; 
    
    // vAltitude for initial lob (Higher multiplier so hard kicks fly over the crossbar)
    state.current.ball.vAltitude = Math.abs(speedY) * altitudeMult; 
    
    state.current.ball.spin = spin;
    
    // Set GK speed (increased slightly to match faster shot speed)
    state.current.gk.speed = 1.3 + Math.random() * 1.8;
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0 cursor-crosshair touch-none"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      />
      {hintVisible && (
        <div className="absolute bottom-[240px] left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
          <div className="animate-bounce flex flex-col items-center">
            <span className="material-symbols-outlined text-primary text-4xl">keyboard_double_arrow_up</span>
            <span className="font-label-caps text-primary-container text-[12px] mt-2">SWIPE TO STRIKE</span>
          </div>
        </div>
      )}
    </>
  );
}
