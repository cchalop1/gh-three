let DATA = {
    github: null,
    error: null,
    username: ''
};

let cubeProfile = undefined;
let cubeActivity = [];
let title = document.getElementById('title');
let input = document.getElementById('input');

const fetchGithubData = async (username) => {
    let res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) {
        let data = await res.json();
        throw new Error(data.messages);
    }
    return await res.json();
};

if (window.location.pathname === '/') {
    DATA.username = '';
    input.focus();
} else {
    DATA.username = window.location.pathname.split('/')[1];
    input.hidden = true;
    fetchGithubData(DATA.username)
        .then(data => {
            DATA.error = null;
            DATA.github = data;
            render3dProfile();
            renderContributions();
            displayProfileName();
        })
        .catch(err => DATA.error = err);
}

const render3dProfile = () => {
    let geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    let texture = new THREE.TextureLoader().load(DATA.github.avatar_url);
    let material = new THREE.MeshBasicMaterial({ map: texture });
    cubeProfile = new THREE.Mesh(geometry, material);
    cubeProfile.position.y = 2.6;
    scene.add(cubeProfile);
};

const renderContributions = () => {
    fetch(`http://localhost:8080/api/contributions/${DATA.username}`)
        .then(res => res.json())
        .then(data => {
            for (let i = 0; i < data.body.length; i++) {
                let geometry = new THREE.BoxGeometry(0.08, 0.2 * data.body[i].count == 0 ? 0.02 : 0.2 * data.body[i].count, 0.08);
                let material = new THREE.MeshLambertMaterial({ color: Number('0x' + data.body[i].color) });
                let cube = new THREE.Mesh(geometry, material);
                cube.position.x = (i - 30) / 3;
                cube.position.y = -2.3;
                cubeActivity.push(cube);
                scene.add(cube);
            }
        });
};
const displayProfileName = () => {
    title.innerHTML = `${DATA.github.login}`;
};

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

let light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1.3);
scene.add(light);

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener('resize', onWindowResize, false);

camera.position.z = 5;

let animate = function () {
    requestAnimationFrame(animate);
    if (cubeProfile !== undefined && cubeActivity.length !== 0) {
        cubeProfile.rotation.x += 0.01;
        cubeProfile.rotation.y += 0.01;
        for (let i = 0; i < cubeActivity.length; i++) {
            cubeActivity[i].position.x -= 0.02;
        }
        renderer.render(scene, camera);
    }
};

window.addEventListener('keypress', (e) => {
    if (e.key === "Enter") {
        DATA.username = input.value;
        window.location = DATA.username;
        input.value = '';
    }
}, false);

animate();
