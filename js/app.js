document.addEventListener('DOMContentLoaded', () => {
    const globe = document.getElementById('globe');
    const globeSnowContainer = document.getElementById('globe-snow');
    // 1. Canvas Snow with Mouse Connectivity
    const canvas = document.getElementById('snow-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;

    // Resize handling
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Mouse tracking
    const mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Toggle connectivity
    const CONNECT_DISTANCE = 200;

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = Math.random() * 1 + 0.5;
            this.size = Math.random() * 2 + 1;
        }

        update() {
            // Mouse Repulsion
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let interactionRadius = 150;

                if (distance < interactionRadius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (interactionRadius - distance) / interactionRadius;
                    const repulsionStrength = 3;

                    this.x -= forceDirectionX * force * repulsionStrength;
                    this.y -= forceDirectionY * force * repulsionStrength;
                }
            }

            this.x += this.vx;
            this.y += this.vy;

            // Reset if out of bounds
            if (this.y > height) {
                this.y = -10;
                this.x = Math.random() * width;
            }
            if (this.x > width) this.x = 0;
            if (this.x < 0) this.x = width;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        }
    }

    const particles = [];
    const particleCount = 200; // Dense snow as requested
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();

            // Connect to mouse
            if (mouse.x != null) {
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < CONNECT_DISTANCE) {
                    const opacity = 1 - (distance / CONNECT_DISTANCE);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        });
        requestAnimationFrame(animate);
    }
    animate();

    // 2. Globe Interaction
    let isShaking = false;
    let shakeCount = 0;
    const letterOverlay = document.getElementById('letter-overlay');
    const closeLetterBtn = document.getElementById('close-letter');

    globe.addEventListener('click', () => {
        if (isShaking) return;

        isShaking = true;
        shakeCount++;
        globe.classList.add('shaking');

        // Agitate snow
        agitateSnow();

        console.log(`Shake count: ${shakeCount}`);

        // Check for secret trigger
        if (shakeCount >= 5) {
            setTimeout(() => {
                letterOverlay.classList.add('visible');
                shakeCount = 0; // Reset or keep? Let's reset for re-playability if desired
            }, 600); // Small delay to let shake finish
        }

        // Remove shake class after animation
        setTimeout(() => {
            globe.classList.remove('shaking');
            isShaking = false;
        }, 500);
    });

    closeLetterBtn.addEventListener('click', () => {
        letterOverlay.classList.remove('visible');
    });

    function agitateSnow() {
        // Clear existing particles if too many, or just add more
        globeSnowContainer.innerHTML = '';

        const flakeCount = 60;
        for (let i = 0; i < flakeCount; i++) {
            const flake = document.createElement('div');
            flake.classList.add('globe-particle');

            // Random positioning inside the circle
            // Simplification: random Left/Top percentages
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const size = Math.random() * 4 + 2;

            flake.style.width = `${size}px`;
            flake.style.height = `${size}px`;
            flake.style.left = `${left}%`;
            flake.style.top = `${top}%`;

            // Physics simulation via CSS animation
            // We'll apply a random chaotic move then fall
            const animationDuration = 2 + Math.random() * 2;

            // Inline dynamic animation
            flake.animate([
                { transform: `translate(0, 0)`, opacity: 0 },
                { transform: `translate(${Math.random() * 40 - 20}px, -${Math.random() * 50 + 20}px)`, opacity: 1, offset: 0.2 },
                { transform: `translate(${Math.random() * 60 - 30}px, 200px)`, opacity: 0, offset: 1 }
            ], {
                duration: animationDuration * 1000,
                easing: 'ease-out',
                fill: 'forwards'
            });

            globeSnowContainer.appendChild(flake);
        }
    }

    // Initial gentle snow in globe
    setInterval(() => {
        if (!isShaking && document.hidden === false) {
            const flake = document.createElement('div');
            flake.classList.add('globe-particle');
            flake.style.width = '3px';
            flake.style.height = '3px';
            flake.style.left = `${Math.random() * 100}%`;
            flake.style.top = '-10px';

            flake.animate([
                { transform: 'translateY(0)', opacity: 1 },
                { transform: 'translateY(300px)', opacity: 0 }
            ], {
                duration: 4000,
                easing: 'linear'
            });

            globeSnowContainer.appendChild(flake);

            // Cleanup
            setTimeout(() => flake.remove(), 4000);
        }
    }, 200);
    // 3. Music Control
    const playBtn = document.getElementById('main-play-btn');
    const playIcon = playBtn.querySelector('.play-icon');
    const pauseIcon = playBtn.querySelector('.pause-icon');
    const bgMusic = document.getElementById('bg-music');
    const progressFill = document.getElementById('progress-fill');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');

    let isPlaying = false;

    function togglePlay() {
        if (isPlaying) {
            bgMusic.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        } else {
            bgMusic.play().catch(e => console.log("Play failed", e));
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }
        isPlaying = !isPlaying;
    }

    playBtn.addEventListener('click', togglePlay);

    // Update Progress
    bgMusic.addEventListener('timeupdate', () => {
        const percent = (bgMusic.currentTime / bgMusic.duration) * 100;
        progressFill.style.width = `${percent}%`;

        // Update time text
        const currentMins = Math.floor(bgMusic.currentTime / 60);
        const currentSecs = Math.floor(bgMusic.currentTime % 60);
        currentTimeEl.textContent = `${currentMins}:${currentSecs < 10 ? '0' : ''}${currentSecs}`;
    });

    // Set duration when metadata loaded
    bgMusic.addEventListener('loadedmetadata', () => {
        const durMins = Math.floor(bgMusic.duration / 60);
        const durSecs = Math.floor(bgMusic.duration % 60);
        durationEl.textContent = `${durMins}:${durSecs < 10 ? '0' : ''}${durSecs}`;
    });

    // Volume Control
    const volumeSlider = document.getElementById('volume-slider');
    volumeSlider.addEventListener('input', (e) => {
        bgMusic.volume = e.target.value;
    });
});
