// Three.js module for My Tech Universe
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('universeCanvas');
const fallback = document.getElementById('threeFallback');

function supportsWebGL(){
  try{ const gl = document.createElement('canvas').getContext('webgl'); return !!gl; }catch(e){return false}
}
if(!supportsWebGL()){
  fallback.style.display = 'flex';
} else {
  fallback.style.display='none';
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x00040a, 0.0009);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x020417, 1);

  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 2000);
  camera.position.set(0,0,40);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false; controls.enableZoom = false; controls.autoRotate = false; controls.enabled = false;

  // Lights
  const amb = new THREE.AmbientLight(0xffffff, 0.4);
  const dir = new THREE.DirectionalLight(0x9be9ff, 0.8);
  dir.position.set(5,10,7);
  scene.add(amb, dir);

  // Cube with MF initials as canvas texture
  function makeTextTexture(text){
    const size = 512; const c = document.createElement('canvas'); c.width = c.height = size; const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0,0,size,size);
    ctx.font = 'bold 220px Inter, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    const grad = ctx.createLinearGradient(0,0,size,size); grad.addColorStop(0,'#00f6ff'); grad.addColorStop(1,'#9b5cff');
    ctx.fillStyle = grad; ctx.fillText(text, size/2, size/2+10);
    return new THREE.CanvasTexture(c);
  }

  const cubeGeo = new THREE.BoxGeometry(8,8,8);
  const tf = makeTextTexture('MF');
  const mats = [];
  for(let i=0;i<6;i++) mats.push(new THREE.MeshStandardMaterial({color:0x031627, emissive:0x003b4d, emissiveIntensity:0.02, map:tf}));
  const cube = new THREE.Mesh(cubeGeo, mats);
  cube.position.set(0,0,0);
  cube.scale.set(0.001,0.001,0.001);
  scene.add(cube);

  // Orbiting spheres
  const orbitGroup = new THREE.Group();
  const sphereMat = new THREE.MeshStandardMaterial({color:0x00f6ff, emissive:0x00f6ff, emissiveIntensity:0.08, metalness:0.4, roughness:0.2});
  const labels = ['AI','IoT','Data'];
  const spheres = [];
  for(let i=0;i<3;i++){
    const s = new THREE.Mesh(new THREE.SphereGeometry(1.1, 32, 32), sphereMat.clone());
    s.userData.role = labels[i];
    const a = (i/3)*Math.PI*2;
    s.position.set(Math.cos(a)*14, Math.sin(a)*6, Math.sin(a)*6);
    orbitGroup.add(s); spheres.push(s);
  }
  scene.add(orbitGroup);

  // Particles
  const particleCount = 600;
  const positions = new Float32Array(particleCount*3);
  for(let i=0;i<particleCount;i++){
    const r = 60*Math.random(); const theta = Math.random()*Math.PI*2; const phi = Math.acos((Math.random()*2)-1);
    positions[i*3] = r*Math.sin(phi)*Math.cos(theta);
    positions[i*3+1] = r*Math.sin(phi)*Math.sin(theta);
    positions[i*3+2] = r*Math.cos(phi);
  }
  const geom = new THREE.BufferGeometry(); geom.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const mat = new THREE.PointsMaterial({color:0xffffff,size:0.12,transparent:true,opacity:0.8,blending:THREE.AdditiveBlending});
  const points = new THREE.Points(geom, mat); scene.add(points);

  // Raycaster for hover
  const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2();
  let lastIntersect = null;

  function onPointerMove(e){
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }
  window.addEventListener('pointermove', onPointerMove);

  // Entrance animation
  let t = 0; const enterDur = 1.2; let last = performance.now()/1000;
  function animate(){
    const now = performance.now()/1000; const dt = now - last; last = now;
    t += dt;
    // entrance scale
    const p = Math.min(1, t/enterDur);
    const ease = p<0.5?2*p*p:1- Math.pow(-2*p+2,2)/2;
    cube.scale.setScalar(ease);

    // orbiting motion
    orbitGroup.rotation.y += 0.0035 + 0.001*Math.sin(now*0.8);
    spheres.forEach((s,idx)=>{
      const a = now*0.6 + idx*2;
      s.position.x = Math.cos(a)*(10 + idx*3);
      s.position.y = Math.sin(a*0.6)*(4+idx*1.6);
      s.rotation.y += 0.01 + idx*0.002;
    });

    // slight cube rotation
    cube.rotation.x += 0.005; cube.rotation.y += 0.008;

    // particles slow drift
    points.rotation.y += 0.0004;

    // hover detection
    ray.setFromCamera(mouse, camera);
    const intersects = ray.intersectObjects([cube, ...spheres], true);
    if(intersects.length){
      const it = intersects[0].object;
      if(lastIntersect !== it){
        // reset previous
        if(lastIntersect) { lastIntersect.material && (lastIntersect.material.emissiveIntensity = 0.08); }
        lastIntersect = it;
        if(it.material){ it.material.emissiveIntensity = 0.8; }
      }
      // accelerate spin
      cube.rotation.x += 0.02; cube.rotation.y += 0.04;
    } else {
      if(lastIntersect){ lastIntersect.material && (lastIntersect.material.emissiveIntensity = 0.08); lastIntersect = null; }
    }

    // parallax camera movement (based on mouse)
    camera.position.x += (mouse.x*6 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y*-4 - camera.position.y) * 0.03;
    camera.lookAt(0,0,0);

    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // resize
  window.addEventListener('resize', ()=>{ camera.aspect = canvas.clientWidth / canvas.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); });
}
