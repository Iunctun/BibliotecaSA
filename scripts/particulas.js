const canvas = document.getElementById('particles-canvas');
        const ctx = canvas.getContext('2d');
        const section = document.querySelector('.card-input');

        let mouse = { x: null, y: null };

        section.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        section.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        function resize() {
            canvas.width = section.offsetWidth;
            canvas.height = section.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // ── Partículas ──
        const dots = Array.from({ length: 60 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2 + 1,
            dx: (Math.random() - 0.5) * 0.5,
            dy: (Math.random() - 0.5) * 0.5,
            alpha: Math.random() * 0.4 + 0.3
        }));

        // ── Livros abertos (só contorno) ──
        function randomBook() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 22 + Math.random() * 20,
                dx: (Math.random() - 0.5) * 0.3,
                dy: (Math.random() - 0.5) * 0.3,
                angle: Math.random() * Math.PI * 2,
                dAngle: (Math.random() - 0.5) * 0.006,
                alpha: Math.random() * 0.25 + 0.12,
                floatOffset: Math.random() * Math.PI * 2,
                floatSpeed: 0.008 + Math.random() * 0.008,
            };
        }

        const books = Array.from({ length: 16 }, randomBook);

        function drawOpenBook(b, t) {
            ctx.save();

            const floatY = Math.sin(t * b.floatSpeed + b.floatOffset) * 5;

            if (mouse.x !== null) {
                const dx = b.x - mouse.x;
                const dy = (b.y + floatY) - mouse.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 110) {
                    const force = (110 - dist) / 110;
                    b.dx += (dx / dist) * force * 0.25;
                    b.dy += (dy / dist) * force * 0.25;
                }
            }

            ctx.translate(b.x, b.y + floatY);
            ctx.rotate(b.angle);
            ctx.globalAlpha = b.alpha;
            ctx.strokeStyle = 'rgba(112, 163, 240, 1)';
            ctx.lineWidth = 1.2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            const s = b.size;

            ctx.beginPath();
            ctx.moveTo(0, -s * 0.6);
            ctx.bezierCurveTo(-s * 0.1, -s * 0.65, -s * 0.9, -s * 0.6, -s, -s * 0.5);
            ctx.lineTo(-s, s * 0.5);
            ctx.bezierCurveTo(-s * 0.9, s * 0.6, -s * 0.1, s * 0.65, 0, s * 0.6);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, -s * 0.6);
            ctx.bezierCurveTo(s * 0.1, -s * 0.65, s * 0.9, -s * 0.6, s, -s * 0.5);
            ctx.lineTo(s, s * 0.5);
            ctx.bezierCurveTo(s * 0.9, s * 0.6, s * 0.1, s * 0.65, 0, s * 0.6);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, -s * 0.6);
            ctx.lineTo(0, s * 0.6);
            ctx.stroke();

            const lineCount = 4;
            for (let i = 0; i < lineCount; i++) {
                const ly = -s * 0.25 + i * (s * 0.15);
                ctx.globalAlpha = b.alpha * 0.5;
                ctx.beginPath();
                ctx.moveTo(-s * 0.8, ly);
                ctx.lineTo(-s * 0.15, ly);
                ctx.stroke();
            }

            for (let i = 0; i < lineCount; i++) {
                const ly = -s * 0.25 + i * (s * 0.15);
                ctx.globalAlpha = b.alpha * 0.5;
                ctx.beginPath();
                ctx.moveTo(s * 0.15, ly);
                ctx.lineTo(s * 0.8, ly);
                ctx.stroke();
            }

            ctx.restore();
        }

        let t = 0;

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            t++;

            dots.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(112, 163, 240, ${p.alpha})`;
                ctx.fill();

                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
            });

            dots.forEach((a, i) => {
                dots.slice(i + 1).forEach(b => {
                    const dist = Math.hypot(a.x - b.x, a.y - b.y);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(112, 163, 240, ${0.18 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });

            books.forEach(b => {
                b.x += b.dx;
                b.y += b.dy;

                b.dx = Math.max(-1, Math.min(1, b.dx)) * 0.99;
                b.dy = Math.max(-1, Math.min(1, b.dy)) * 0.99;
                b.angle += b.dAngle;

                if (b.x < -60) b.x = canvas.width + 60;
                if (b.x > canvas.width + 60) b.x = -60;
                if (b.y < -60) b.y = canvas.height + 60;
                if (b.y > canvas.height + 60) b.y = -60;

                drawOpenBook(b, t);
            });

            requestAnimationFrame(draw);
        }

        draw();