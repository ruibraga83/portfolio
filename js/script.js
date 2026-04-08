// ========================================
// GLOBAL VARIABLES
// ========================================

let scene, camera, renderer, neuralSphere;
let particles = [];
let mouse = { x: 0, y: 0 };
let windowHalf = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

// ========================================
// NAVIGATION
// ========================================

const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Hamburger menu toggle
hamburger?.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close menu when link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scrolling for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// TYPING ANIMATION
// ========================================

const typingText = document.querySelector('.typing-text');
const texts = [
    'Full-Stack Developer',
    'AI Engineer',
    'Optimization Specialist',
    'Data Scientist',
    'Neural Network Architect'
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeText() {
    const currentText = texts[textIndex];
    
    if (isDeleting) {
        typingText.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typingText.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }
    
    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typingSpeed = 500; // Pause before typing next
    }
    
    setTimeout(typeText, typingSpeed);
}

if (typingText) {
    typeText();
}

// ========================================
// NEURAL NETWORK CANVAS BACKGROUND
// ========================================

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
        this.connections = [];
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounce off edges
        if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;
        
        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
            const angle = Math.atan2(dy, dx);
            this.vx -= Math.cos(angle) * 0.05;
            this.vy -= Math.sin(angle) * 0.05;
        }
        
        // Velocity damping
        this.vx *= 0.99;
        this.vy *= 0.99;
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
    }
}

function initNeuralCanvas() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create particles
    const particleCount = window.innerWidth < 768 ? 50 : 100;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas));
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw(ctx);
        });
        
        // Draw connections
        ctx.shadowBlur = 0;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    const opacity = 1 - (distance / 150);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.3})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        windowHalf.x = window.innerWidth / 2;
        windowHalf.y = window.innerHeight / 2;
    });
}

// ========================================
// THREE.JS 3D NEURAL SPHERE
// ========================================

function initThreeJS() {
    const container = document.getElementById('three-container');
    if (!container) return;
    
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Create neural sphere
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    neuralSphere = new THREE.Mesh(geometry, material);
    scene.add(neuralSphere);
    
    // Add particles to sphere
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x00f0ff,
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate sphere
        neuralSphere.rotation.x += 0.001;
        neuralSphere.rotation.y += 0.002;
        
        // Rotate particles
        particleSystem.rotation.x += 0.0005;
        particleSystem.rotation.y += 0.001;
        
        // Mouse interaction
        camera.position.x += (mouse.x * 0.0005 - camera.position.x) * 0.05;
        camera.position.y += (-mouse.y * 0.0005 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ========================================
// MOUSE TRACKING
// ========================================

document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX - windowHalf.x;
    mouse.y = e.clientY - windowHalf.y;
});

// ========================================
// PARALLAX EFFECT
// ========================================

function initParallax() {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxLayers.forEach((layer, index) => {
            const speed = (index + 1) * 0.5;
            layer.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// ========================================
// SCROLL ANIMATIONS WITH GSAP
// ========================================

function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Fade in elements
    gsap.utils.toArray('.skill-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            delay: index * 0.1
        });
    });
    
    gsap.utils.toArray('.project-card').forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            rotateX: -15,
            duration: 0.8,
            delay: index * 0.1
        });
    });
    
    // Section headers
    gsap.utils.toArray('.section-header').forEach(header => {
        gsap.from(header, {
            scrollTrigger: {
                trigger: header,
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 30,
            duration: 0.8
        });
    });
    
    // About section
    gsap.from('.about-image', {
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top 60%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: -50,
        duration: 1
    });
    
    gsap.from('.about-text', {
        scrollTrigger: {
            trigger: '.about-section',
            start: 'top 60%',
            toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: 50,
        duration: 1
    });
}

// ========================================
// COUNTER ANIMATION
// ========================================

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200;
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const increment = target / speed;
                let count = 0;
                
                const updateCount = () => {
                    count += increment;
                    if (count < target) {
                        counter.textContent = Math.ceil(count);
                        setTimeout(updateCount, 10);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCount();
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

// ========================================
// CONTACT FORM
// ========================================

function initContactForm() {
    const form = document.querySelector('.contact-form');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            console.log('Form submitted:', data);
            
            // Show success message
            const button = form.querySelector('.btn-submit');
            const originalText = button.innerHTML;
            
            button.innerHTML = '<span class="btn-text">Message Sent!</span><i class="fas fa-check"></i>';
            button.style.background = 'linear-gradient(45deg, #00ff88, #00f0ff)';
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.style.background = '';
                form.reset();
            }, 3000);
        });
    }
}

// ========================================
// CONTACT CANVAS ANIMATION
// ========================================

function initContactCanvas() {
    const canvas = document.getElementById('contactCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = document.querySelector('.contact-section').offsetHeight;
    
    const nodes = [];
    const nodeCount = 30;
    
    class Node {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.radius = Math.random() * 3 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(139, 92, 246, 0.6)';
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
            ctx.fill();
        }
    }
    
    for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        nodes.forEach(node => {
            node.update();
            node.draw();
        });
        
        // Draw connections
        ctx.shadowBlur = 0;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 200) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    const opacity = 1 - (distance / 200);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.3})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ========================================
// GLITCH EFFECT
// ========================================

function initGlitchEffect() {
    const glitchText = document.querySelector('.glitch-text');
    
    if (glitchText) {
        setInterval(() => {
            const dataText = glitchText.getAttribute('data-text');
            glitchText.setAttribute('data-text', dataText);
        }, 3000);
    }
}

// ========================================
// INITIALIZE ALL
// ========================================

window.addEventListener('DOMContentLoaded', () => {
    initNeuralCanvas();
    initThreeJS();
    initParallax();
    initScrollAnimations();
    animateCounters();
    initContactForm();
    initContactCanvas();
    initGlitchEffect();
});

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

// Throttle function for scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    const lazyImages = document.querySelectorAll('img.lazy');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ========================================
// CURSOR TRAIL EFFECT (OPTIONAL)
// ========================================

const cursorDot = document.createElement('div');
cursorDot.style.cssText = `
    position: fixed;
    width: 8px;
    height: 8px;
    background: var(--primary-color);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    box-shadow: 0 0 20px var(--primary-color);
    transition: transform 0.15s ease;
`;
document.body.appendChild(cursorDot);

const cursorOutline = document.createElement('div');
cursorOutline.style.cssText = `
    position: fixed;
    width: 40px;
    height: 40px;
    border: 2px solid var(--primary-color);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transition: all 0.15s ease;
`;
document.body.appendChild(cursorOutline);

let cursorX = 0;
let cursorY = 0;
let outlineX = 0;
let outlineY = 0;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

function animateCursor() {
    cursorDot.style.left = cursorX + 'px';
    cursorDot.style.top = cursorY + 'px';
    
    outlineX += (cursorX - outlineX) * 0.1;
    outlineY += (cursorY - outlineY) * 0.1;
    
    cursorOutline.style.left = (outlineX - 20) + 'px';
    cursorOutline.style.top = (outlineY - 20) + 'px';
    
    requestAnimationFrame(animateCursor);
}

animateCursor();

// Cursor interaction with interactive elements
const interactiveElements = document.querySelectorAll('a, button, .skill-card, .project-card');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorDot.style.transform = 'scale(2)';
        cursorOutline.style.transform = 'scale(1.5)';
    });
    
    el.addEventListener('mouseleave', () => {
        cursorDot.style.transform = 'scale(1)';
        cursorOutline.style.transform = 'scale(1)';
    });
});

// Hide custom cursor on mobile
if (window.innerWidth < 768) {
    cursorDot.style.display = 'none';
    cursorOutline.style.display = 'none';
}

console.log('%c🚀 GroundOptimizer Portfolio Loaded', 'color: #00f0ff; font-size: 20px; font-weight: bold;');
console.log('%cDeveloped by Rui Braga', 'color: #8b5cf6; font-size: 14px;');
