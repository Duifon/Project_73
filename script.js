// Переключение темы
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.dataset.theme = body.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', body.dataset.theme);
});

// Загрузка сохраненной темы
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.dataset.theme = savedTheme;
}

// Мобильное меню
const menuToggle = document.querySelector('.menu-toggle');
menuToggle.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Анимации при скролле
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.card, .timeline-item, .feature-card').forEach((el) => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});



// Параллакс-эффект
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    document.querySelector('.hero').style.backgroundPositionY = scrolled * 0.5 + 'px';
});
// Функция загрузки и воспроизведения видео
function loadVideo(videoFile) {
    const videoPlayer = document.querySelector('.emergency-video');
    const videoContainer = document.querySelector('.video-container');
    const placeholder = document.querySelector('.placeholder-text');

    if (videoFile) {
        // Показываем видео и скрываем плейсхолдер
        videoContainer.classList.add('has-video');
        placeholder.style.display = 'none';
        videoPlayer.src = videoFile;
        videoPlayer.load();
        
        // Пытаемся запустить автовоспроизведение
        videoPlayer.play().catch(error => {
            console.log('Автовоспроизведение заблокировано. Нажмите на видео для запуска.');
        });
    } else {
        // Сбрасываем видео и показываем плейсхолдер
        videoContainer.classList.remove('has-video');
        placeholder.style.display = 'block';
        videoPlayer.src = '';
    }

    // Обновляем активную кнопку
    document.querySelectorAll('.scenario-buttons button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.video === videoFile) btn.classList.add('active');
    });
}

// Обработчики кнопок
document.querySelectorAll('.scenario-buttons button[data-video]').forEach(button => {
    button.addEventListener('click', () => {
        const videoFile = button.dataset.video;
        loadVideo(videoFile); // Запуск выбранного видео
    });
});

// Кнопка сброса
document.getElementById('resetBtn').addEventListener('click', () => {
    loadVideo(null); // Скрываем видео и показываем плейсхолдер
});

// Three.js Integration
let scene, camera, renderer, model, controls;

function init3DViewer() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 
        document.getElementById('modelContainer').offsetWidth / 500, 
        0.1, 
        1000
    );
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
        document.getElementById('modelContainer').offsetWidth, 
        500
    );
    document.getElementById('modelContainer').appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 5;
    
    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
}

const loader = new THREE.GLTFLoader();

// Функция загрузки модели
function loadModel(x) {
    // Показываем индикатор загрузки
    document.querySelector('.loading-overlay').style.display = 'block';

    loader.load(
        `school_norm.glb`, // Путь к .glb файлу
        (gltf) => {
            // Удаляем предыдущую модель
            if(model) scene.remove(model);
            
            // Настройка загруженной модели
            model = gltf.scene;
            model.scale.set(1, 1, 1); // Масштабирование при необходимости
            model.position.set(0, 0, 0);
            
            scene.add(model);
            
            // Скрываем индикатор загрузки
            document.querySelector('.loading-overlay').style.display = 'none';
        },
        (xhr) => {
            // Отслеживание прогресса загрузки
            console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
        },
        (error) => {
            // Обработка ошибок
            console.error('Error loading model:', error);
            document.querySelector('.loading-overlay').style.display = 'none';
        }
    );
}

// Пример использования
loadModel(x); 

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function rotateModel() {
    if(model) {
        model.rotation.x += 0.1;
        model.rotation.y += 0.1;
    }
}

// Initialize on load
window.addEventListener('load', () => {
    init3DViewer();
    loadModel('school_norm');
});

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = document.getElementById('modelContainer').offsetWidth / 500;
    camera.updateProjectionMatrix();
    renderer.setSize(
        document.getElementById('modelContainer').offsetWidth, 
        500
    );
});