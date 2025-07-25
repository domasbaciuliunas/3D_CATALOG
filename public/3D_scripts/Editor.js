import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
let loader = new GLTFLoader();

class spotLight {
  constructor(color, intensity, distance, angle, penumbra, position) {
    this.spotLight = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
    this.spotLight.position.set(position.x, position.y, position.z);
    this.spotLight.castShadow = true;
    this.spotLight.shadow.bias = -0.0001;
  }

  add_to_scene(scene) {
    scene.add(this.spotLight);
  }

  set_position(position) {
    this.spotLight.position.set(position.x, position.y, position.z);
  }

  remove_spotlight(scene) {
    if (this.spotLight.shadow && this.spotLight.shadow.map) {
      this.spotLight.shadow.map.dispose();
      this.spotLight.shadow.map = null;
    }
    this.spotLight.shadow.camera = null;
    this.spotLight.shadow = null;
    this.spotLight.target = null;
    scene.remove(this.spotLight);
  }
}

class ambientLight {
  constructor(color, intensity) {
    this.ambientLight = new THREE.AmbientLight(color, intensity);
  }
  add_to_scene(scene) {
    scene.add(this.ambientLight);
  }
  remove_ambient_light(scene) {
    scene.remove(this.ambientLight);
  }
}

class GLB_model {
  constructor(path, name, y_scale, scene, callback) {
    loader.load((path + name), (glb) => {
      this.glb_scene = glb.scene;
      let box = new THREE.Box3().setFromObject(this.glb_scene);
      this.size = box.getSize(new THREE.Vector3());
      this.y_scalar = y_scale / this.size["y"]; 
      this.glb_scene.scale.set(this.y_scalar, this.y_scalar, this.y_scalar);
      this.glb_scene.position.set(0, 0, 0);
      this.glb_scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(this.glb_scene);
    });
    callback();
  }

  change_size(desired_scale) {
     this.glb_scene.scale.set(desired_scale / this.size["y"], desired_scale / this.size["y"], desired_scale / this.size["y"]);
  }

  get_size() {
    return this.glb_scene.scale;
  }

  remove_glb(scene) {
    scene.remove(this.glb_scene);
  }
}
class Editor {
  constructor(view_height, section_id, camera_position, min_zoom, max_zoom) {
    //spotlight and ambient light arrays
    this.spotlights = {};
    this.ambientLights = {};
    this.glb_model;

    this.view_height = view_height;
    this.scene = new THREE.Scene();

    //loads the textures
    const textureLoader = new THREE.TextureLoader();
    const left_arrow = textureLoader.load('/images/textures/icons8-arrow-left.png');
    const right_arrow = textureLoader.load('/images/textures/icons8-arrow-right.png');
    const question_mark = textureLoader.load('/images/textures/icons8-question-50.png');

    //adds arrows to the scene
    this.arrow_r = new THREE.Sprite(new THREE.SpriteMaterial({ map: right_arrow }));
    this.arrow_r.name = `Rightarrow`;
    this.arrow_l = new THREE.Sprite(new THREE.SpriteMaterial({ map: left_arrow }));
    this.arrow_l.name = `Leftarrow`;

    //adds a camera to the scene
    this.section = document.getElementById(section_id);
    let size = this.section.getBoundingClientRect();
    let { width } = size;
    this.camera = new THREE.PerspectiveCamera(45, width / this.view_height, 1, 1000);
    this.camera.position.set(camera_position["x"], camera_position["y"], camera_position["z"]);
    this.scene.add(this.camera);

    //create new renderer and add a canvas to the document
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.domElement.classList.add('mb-3');
    this.renderer.setSize(width, view_height);
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = `${view_height}px`;
    this.section.insertBefore(this.renderer.domElement, this.section.firstChild);
    this.renderer.render(this.scene, this.camera);

    //add arrows to the camera 
    this.camera.add(this.arrow_r);
    this.camera.add(this.arrow_l);
    this.arrow_r.position.set(7 * this.section.getBoundingClientRect().width / this.view_height, 0, -20)
    this.arrow_l.position.set(- 7 * this.section.getBoundingClientRect().width / this.view_height, 0, -20);

    //adds orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    //orbit controls settings
    this.controls.enablePan = false;
    this.controls.minDistance = min_zoom;
    this.controls.maxDistance = max_zoom;
    this.controls.update();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  //function to calculate the section size
  get_section_size() {
    let size = this.section.getBoundingClientRect();
    let { width } = size;
    return width;
  }

  //automatic resize of the renderer
  resize() {
    window.addEventListener('resize', () => {
      let width = this.get_section_size();
      this.renderer.setSize(width, this.view_height);
      this.camera.aspect = width / this.view_height;
      this.camera.updateProjectionMatrix();
      this.renderer.domElement.style.width = "100%";
      this.renderer.domElement.style.height = `${this.view_height}px`;
      this.arrow_r.position.set(7 * this.section.getBoundingClientRect().width / this.view_height, 0, -20)
      this.arrow_l.position.set(- 7 * this.section.getBoundingClientRect().width / this.view_height, 0, -20);
    });
  }

  //add GLB model to the scene
  add_GLB(path, name, y_scale, callback) {
    const GLB = new GLB_model(path, name, y_scale, this.scene, callback);
    this.glb_model = GLB;
  }

  remove_GLB() {
    if (this.glb_model) {this.glb_model.remove_glb(this.scene)};
  }
}

class BasicEditor extends Editor {
  //method to change the size of the GLB
  change_size(size) {
    this.glb_model.change_size(size);
  }

  get_size() {
    return this.glb_model.get_size();
  }

  //add a spotlight to the scene
  add_spotlight(color, intensity, distance, angle, penumbra, position, name) {
    const SpotLight = new spotLight(color, intensity, distance, angle, penumbra, position);
    SpotLight.add_to_scene(this.scene);
    this.spotlights[`${name}`] = SpotLight;
  }

  //change spotlight position
  change_spotligh_position(name, position) {
    this.spotlights[`${name}`].set_position(position);
  }

  //change spotlight intensity
  change_spotlight_intensity(intensity, name) {
    this.spotlights[`${name}`].spotLight.intensity = intensity;
  }

  //change spotlight color
  change_spotlight_color(color, name) {
    this.spotlights[`${name}`].spotLight.color.setRGB(color.r, color.g, color.b);
  }

  //change spotlight distance
  change_spotlight_distance(distance, name) {
    this.spotlights[`${name}`].spotLight.distance = distance
  }

  //change spotlight penumbra
  change_spotlight_penumbra(penumbra, name) {
    this.spotlights[`${name}`].spotLight.penumbra = penumbra
  }

  //change spotlight angle
  change_spotlight_angle(degrees, name) {
    var pi = Math.PI;
    let radians = degrees * (pi / 180);
    this.spotlights[`${name}`].spotLight.angle = radians;
  }

  //change spotlight coordinates
  change_spotlight_coordinates(coords, name) {
    this.spotlights[`${name}`].spotLight.position.set(coords.x, coords.y, coords.z)
  }

  //remove spotlight from the scene
  remove_spotlight(name) {
    this.spotlights[`${name}`].remove_spotlight(this.scene);
    delete this.spotlights[`${name}`];
  }

  //get spotlight arrays
  get_spotlights() {
    return this.spotlights;
  }

  //add ambient light to the scene 
  add_ambient_light(color, intensity, name) {
    const AmbientLight = new ambientLight(color, intensity);
    AmbientLight.add_to_scene(this.scene);
    this.ambientLights[`${name}`] = AmbientLight;
  }

  //update ambient light color
  change_ambient_light_color(color, name) {
    this.ambientLights[`${name}`].ambientLight.color.setRGB(color.r, color.g, color.b);
  }

  //update ambient light intesity
  change_ambient_light_intensity(intensity, name) {
    this.ambientLights[`${name}`].ambientLight.intensity = intensity;
  }

  //remove ambient light from the scene
  remove_ambient_light(name) {
    this.ambientLights[`${name}`].remove_ambient_light(this.scene);
    delete this.ambientLights[`${name}`];
  }

  //get ambient lights arrays
  get_ambient_lights() {
    return this.ambientLights;
  }
}

export { BasicEditor };