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
    this.scene = scene;
    this.isRemoved = false; // Track if removed before load finishes
    loader.load((path + name), (glb) => {
      if (this.isRemoved) return; // Don't add if already removed
      this.glb_scene = glb.scene;
      this.glb_scene.name = "MAIN_MODEL";
      this.glb_scene.traverse((child) => {
        if (child.isMesh) {
          child.userData.mainModel = true;
          if (!this.mainMeshSet) {
            child.name = "MAIN_MODEL";
            this.mainMeshSet = true;
          }
        }
      });

      let box = new THREE.Box3().setFromObject(this.glb_scene);
      this.size = box.getSize(new THREE.Vector3());
      this.y_scalar = y_scale / this.size["y"];
      this.original_scale = this.y_scalar;
      this.glb_scene.scale.set(this.y_scalar, this.y_scalar, this.y_scalar);
      this.center_item();
      this.glb_scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      scene.add(this.glb_scene);
      if (typeof callback === 'function') callback(this.glb_scene);
    });
  }

  //method to center the item
  center_item() {
    let box = new THREE.Box3().setFromObject(this.glb_scene);
    var center = new THREE.Vector3();
    box.getCenter(center);
    this.glb_scene.position.sub(center);
  }

  get_original_scale() {
    return this.original_scale;
  }

  change_size(desired_scale) {
    this.glb_scene.scale.set(desired_scale / this.size["y"], desired_scale / this.size["y"], desired_scale / this.size["y"]);
    this.center_item();
  }

  get_size() {
    return this.glb_scene.scale;
  }

  remove_glb(scene) {
    this.isRemoved = true;
    if (this.glb_scene) {
      scene.remove(this.glb_scene);
    }
  }
}

class Pointer_Event {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.coordinates = null;
    this._listener = null;  // Store listener function to allow removal
  }

  calculate_position(event, callback) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length > 0) {
      // find the first intersect that belongs to the loaded model (walk parents)
      const hitIndex = intersects.findIndex((it) => {
        let o = it.object;
        while (o) {
          if (o.name === "MAIN_MODEL" || (o.userData && o.userData.mainModel)) return true;
          o = o.parent;
        }
        return false;
      });
      if (hitIndex !== -1) {
        const obj = intersects[hitIndex].object;
        // use the corresponding point
        const point = intersects[hitIndex].point;
        point.x = Math.round((point.x + Number.EPSILON) * 100) / 100;
        point.y = Math.round((point.y + Number.EPSILON) * 100) / 100;
        point.z = Math.round((point.z + Number.EPSILON) * 100) / 100;
        this.coordinates = point;
        // Call the callback function to notify the event
        if (typeof callback === 'function') {
          callback(this.coordinates);
        }
      }
    }
    // Remove the event listener only after the click has been processed
    this.renderer.domElement.removeEventListener('click', this._listener);
  }

  pointer_event(callback) {
    // Remove the previous listener if it exists
    if (this._listener) {
      this.renderer.domElement.removeEventListener('click', this._listener);
    }

    // Store the new listener function for future removal
    this._listener = (event) => this.calculate_position(event, callback);
    this.renderer.domElement.addEventListener('click', this._listener);
  }

  get_event_coordinates() {
    return this.coordinates;
  }

  removeEventListener() {
    this.renderer.domElement.removeEventListener('click', this._listener);
  }
}

class Editor {
  constructor(view_height, section_id, camera_position, min_zoom, max_zoom) {
    //spotlight and ambient light arrays
    this.spotlights = {};
    this.ambientLights = {};
    this.interest_points = {};
    this.glb_model;
    this.camera_coords;

    this.view_height = view_height;
    this.scene = new THREE.Scene();

    //loads the textures
    this.textureLoader = new THREE.TextureLoader();
    const left_arrow = this.textureLoader.load('/images/textures/icons8-arrow-left.png');
    const right_arrow = this.textureLoader.load('/images/textures/icons8-arrow-right.png');

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
    this.remove_GLB(); // Always remove previous GLB before loading new one
    this.glb_model = new GLB_model(path, name, y_scale, this.scene, callback);
  }

  remove_GLB() {
    if (this.glb_model) {
      this.glb_model.remove_glb(this.scene);
      this.glb_model = null;
    }
  }
}

class BasicEditor extends Editor {
  constructor(view_height, section_id, camera_position, min_zoom, max_zoom) {
    super(view_height, section_id, camera_position, min_zoom, max_zoom);
    this.cubeTextureLoader = new THREE.CubeTextureLoader();

    //adds a pointer event object for the scene
    this.pointer_event = new Pointer_Event(this.renderer, this.scene, this.camera);
  }

  //method to change the size of the GLB
  change_size(size) {
    let old_size = this.get_size().clone();;
    this.glb_model.change_size(size);
    let refrence_size = this.get_size();
    let original_scale = this.glb_model.get_original_scale();

    //calculated_scale
    let calculated_scale = (refrence_size.y / original_scale) - (refrence_size.y / original_scale) * 0.3;

    //scales the interest points according to size
    for (let key in this.interest_points) {

      let x_equation = (refrence_size["x"] * this.interest_points[key].position["x"]) / old_size["x"];
      let y_equation = (refrence_size["y"] * this.interest_points[key].position["y"]) / old_size["y"];
      let z_equation = (refrence_size["z"] * this.interest_points[key].position["z"]) / old_size["z"];

      this.interest_points[key].scale.set(calculated_scale, calculated_scale, 1);

      this.interest_points[key].position.set(x_equation, y_equation, z_equation);
    }
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

  // Advanced displacement function
  applyDisplacement(coordinates, options = {}) {
    // Default options
    const {
      distance = 0.3,
      direction = { x: 1, y: 1, z: 1 }, // Use 1 or -1 for each axis, or 0 for none
      scale = 1,
      customDisplacement = null // Optional callback for custom logic
    } = options;

    let displaced = coordinates.clone ? coordinates.clone() : { ...coordinates };

    if (typeof customDisplacement === 'function') {
      return customDisplacement(displaced, options);
    }

    // Apply displacement per axis
    ['x', 'y', 'z'].forEach(axis => {
      if (displaced[axis] !== undefined) {
        displaced[axis] += direction[axis] * distance * scale;
      }
    });
    return displaced;
  }

  //returns the pointer event and creates an interest_point
  Create_interestPoint(_id, onClickCallback, state) {
    this.pointer_event.pointer_event((coordinates) => {
      if (coordinates) {
        // Remove existing point if present
        if (this.interest_points[_id]) {
          let existing = this.interest_points[_id];
          this.scene.remove(existing);
          existing.material.dispose();
          this.interest_points[_id] = null;
        }

        // Create and add new interest point
        const question_mark_white = this.textureLoader.load('/images/textures/icons8-question-50.png');
        const question_mark_black = this.textureLoader.load('/images/textures/icons8-question-50black.png');

        const white_material = new THREE.SpriteMaterial({ map: question_mark_white });
        const black_material = new THREE.SpriteMaterial({ map: question_mark_black });

        let interest_point;
        if (state === false) { interest_point = new THREE.Sprite(white_material); }
        else if (state === true) { interest_point = new THREE.Sprite(black_material); }

        let refrence_size = this.get_size();
        let original_scale = this.glb_model.get_original_scale();

        //calculated_scale
        let calculated_scale = (refrence_size.y / original_scale) - (refrence_size.y / original_scale) * 0.3;
        interest_point.scale.set(calculated_scale, calculated_scale, 1);

        let displacedCoordinates = this.applyDisplacement(coordinates, {
          distance: 0.3,
          direction: {
            x: coordinates.x >= 0 ? 1 : -1,
            y: coordinates.y >= 0 ? 1 : -1,
            z: coordinates.z >= 0 ? 1 : -1
          },
          scale: 1
        });

        //sets the camera postion to a variable
        this.camera_coords = this.camera.position;

        interest_point.position.copy(displacedCoordinates);
        this.scene.add(interest_point);
        this.interest_points[_id] = interest_point;

        if (typeof onClickCallback === 'function') {
          onClickCallback(displacedCoordinates);
        }
      }
    });
  }

  //function to delete an interest point
  Delete_InterestPoint(id) {
    this.pointer_event.removeEventListener();
    let sprite = this.interest_points[id]
    if (sprite) {
      this.scene.remove(sprite);
      sprite.material.dispose();
      sprite = null;
    }
  }

  //return the interest point
  get_InterestPoint(key) {
    return this.interest_points[key];
  }

  //return all interest points
  get_InterestPoints() {
    return this.interest_points;
  }

  get_camera_position() {
    return this.camera_coords;
  }

  change_arrow_color(color) {
    const left_arrow = this.textureLoader.load('/images/textures/icons8-sort-left-48black.png');
    const right_arrow = this.textureLoader.load('/images/textures/icons8-sort-right-48black.png');
    let black_material_right = new THREE.SpriteMaterial({ map: right_arrow });
    let black_material_left = new THREE.SpriteMaterial({ map: left_arrow });
    const left_arrow_white = this.textureLoader.load('/images/textures/icons8-arrow-left.png');
    const right_arrow_white = this.textureLoader.load('/images/textures/icons8-arrow-right.png')
    let white_material_right = new THREE.SpriteMaterial({ map: right_arrow_white });
    let white_material_left = new THREE.SpriteMaterial({ map: left_arrow_white });
    if (color === "black") {
      this.arrow_r.material = black_material_right;
      this.arrow_l.material = black_material_left;
    }
    else if (color === "white") {
      this.arrow_r.material = white_material_right;
      this.arrow_l.material = white_material_left;
    }
  }

  change_interestpoint_color(color) {
    const question_mark_white = this.textureLoader.load('/images/textures/icons8-question-50.png');
    const question_mark_black = this.textureLoader.load('/images/textures/icons8-question-50black.png');
    let white_material = new THREE.SpriteMaterial({ map: question_mark_white });
    let black_material = new THREE.SpriteMaterial({ map: question_mark_black });

    if (color === "black") {
      for (let key in this.interest_points) {
        this.interest_points[key].material = black_material;
      }
    }
    else if (color == "white") {
      for (let key in this.interest_points) {
        this.interest_points[key].material = white_material;
      }
    }
  }
  //changes the background path and sets background
  change_background(path) {
    this.cubeTextureLoader.setPath(`/images/cubemaps/${path}/`);
    const backgroundCubemap = this.cubeTextureLoader.load([
      '_px.png',
      '_nx.png',
      '_py.png',
      '_ny.png',
      '_pz.png',
      '_nz.png'
    ]);
    this.scene.background = backgroundCubemap;
  }
}

class CatalogEditor extends Editor {
  constructor(view_height, section_id, camera_position, min_zoom, max_zoom) {
    super(view_height, section_id, camera_position, min_zoom, max_zoom);
    this.item_array = [];
    this.index = 0;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2()
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.about = document.getElementById("about");
  }

  //sets the current index of the item array
  set_current_index(index) {
    this.index = index;
  }

  get_item_array_length() {
    return this.item_array.length - 1;
  }

  //loads the resources into the item array
  load_resource(spotlights, ambient_lights, interest_points, glb_models, cubemaps, products, id, name) {
    this.item_array.push({
      "spotLights": spotlights,
      "ambientLights": ambient_lights,
      "interestPoints": interest_points,
      "glbModel": glb_models,
      "cubemap": cubemaps,
      "product": products,
      "id": id,
      "name": name
    });
    console.log(this.item_array);
  }

  //finds the index of an item in the item array by its id
  find_by_id(id) {
    return this.item_array.findIndex(item => item.id === id);
  }

  //returns all the items inside the array
  get_items() {
    return this.item_array;
  }

  //switch the indexes places
  switch_places(old_index, new_index) {
    let old_i = this.find_by_id(old_index);
    let new_i = this.find_by_id(new_index);
    let temp = this.item_array[old_i];
    this.item_array[old_i] = this.item_array[new_i];
    this.item_array[new_i] = temp;
    if (this.index === old_i || this.index === new_i) {
      this.reconstruct_scene(this.index);
    }
  }

  //appends the text to the about section
  parse_text(text) {
    let div = document.getElementById("paragraphs");
    let p = document.createElement("p");
    p.innerText = text;
    div.appendChild(p);
  }

  //pointer event for changing the pages and interacting with the interest points
  page_event(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    //read the DOM
    let open_icon = document.getElementById('open_icon');
    let description = document.getElementById("desc");
    let description_div = document.querySelector("#desc div");

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.name == `Rightarrow` && this.index < this.item_array.length - 1) {
        this.index = this.index + 1;
        this.reconstruct_scene(this.index);
        let parsed_data = window.keyed_products[this.item_array[this.index]["product"]["id"]];
        description_div.innerHTML = parsed_data["description"];
        this.about.style.display = "none";
        description.style.display = 'none';
        open_icon.style.display = 'block';
      }
      if (obj.name == `Leftarrow` && this.index > 0) {
        this.index = this.index - 1;
        this.reconstruct_scene(this.index);
        let parsed_data = window.keyed_products[this.item_array[this.index]["product"]["id"]];
        description_div.innerHTML = parsed_data["description"];
        this.about.style.display = "none";
        description.style.display = 'none';
        open_icon.style.display = 'block';
      }
      if (intersects[1]) {
        const obj_2 = intersects[1].object;
        if (this.interest_points[obj.name]) {
          this.about.style.display = "block";
          document.getElementById("headers").innerHTML = "";
          document.getElementById("paragraphs").innerHTML = ""; // Clear previous content
          document.getElementById("headers").innerHTML = this.interest_points[obj.name].header
          this.parse_text(this.interest_points[obj.name].text);
          let camera_coords = this.interest_points[obj.name].camera_XYZ;
          let camera_position = {
            "x": Number(camera_coords[0]),
            "y": Number(camera_coords[1]),
            "z": Number(camera_coords[2])
          }
          this.camera.position.set(camera_position["x"], camera_position["y"], camera_position["z"]);
        }
        else if (this.interest_points[obj_2.name]) {
          this.about.style.display = "block";
          document.getElementById("headers").innerHTML = "";
          document.getElementById("paragraphs").innerHTML = ""; // Clear previous content
          document.getElementById("headers").innerHTML = this.interest_points[obj_2.name].header
          this.parse_text(this.interest_points[obj_2.name].text);
          let camera_coords = this.interest_points[obj_2.name].camera_XYZ;
          let camera_position = {
            "x": Number(camera_coords[0]),
            "y": Number(camera_coords[1]),
            "z": Number(camera_coords[2])
          }
          this.camera.position.set(camera_position["x"], camera_position["y"], camera_position["z"]);
        }
      }
    }
  }

  add_page_event_listener() {
    this.renderer.domElement.addEventListener('click', (event) => this.page_event(event));
  }

  reconstruct_scene(index, callback) {
    let open_icon = document.getElementById('open_icon');
    let description = document.getElementById("desc");

    description.style.display = 'none';
    open_icon.style.display = 'block';

    this.clear_scene()
    this.remove_GLB();
    //load the GLB model
    this.add_GLB("/GLB_FILES/", this.item_array[index].glbModel.GLB_ID, this.item_array[index].product.item_scale);
    //load the cubemap
    this.cubeTextureLoader.setPath(`/images/cubemaps/${this.item_array[index].cubemap[0]["cubemap_folder"]}/`);
    const backgroundCubemap = this.cubeTextureLoader.load([
      '_px.png',
      '_nx.png',
      '_py.png',
      '_ny.png',
      '_pz.png',
      '_nz.png'
    ]);
    this.scene.background = backgroundCubemap;

    //add the spotlights
    let spotlights = this.item_array[index].spotLights;
    if (spotlights.length > 0) {
      for (let spotlight of spotlights) {
        let spotlight_position = spotlight.XYZ.split(",");
        spotlight_position = { x: Number(spotlight_position[0]), y: Number(spotlight_position[1]), z: Number(spotlight_position[2]) };
        let spotlight_colors = spotlight.RGB.split(",");
        spotlight_colors = { r: Number(spotlight_colors[0]), g: Number(spotlight_colors[1]), b: Number(spotlight_colors[2]) };
        const pi = Math.PI;
        let radians = spotlight.angle * (pi / 180);
        let SpotLight = new spotLight("white", spotlight.intensity, spotlight.distance, radians, spotlight.penumbra, spotlight_position);
        SpotLight.spotLight.color.setRGB(spotlight_colors.r, spotlight_colors.g, spotlight_colors.b);
        SpotLight.add_to_scene(this.scene);
        this.spotlights[`${crypto.randomUUID()}`] = SpotLight;
      }
    }

    //add the ambient lights
    let ambient_lights = this.item_array[index].ambientLights;
    if (ambient_lights.length > 0) {
      for (let ambient_light of ambient_lights) {
        let ambient_light_colors = ambient_light.RGB.split(",");
        ambient_light_colors = { r: Number(ambient_light_colors[0]), g: Number(ambient_light_colors[1]), b: Number(ambient_light_colors[2]) };
        let AmbientLight = new ambientLight("white", ambient_light.intensity);
        AmbientLight.ambientLight.color.setRGB(ambient_light_colors.r, ambient_light_colors.g, ambient_light_colors.b);
        AmbientLight.add_to_scene(this.scene);
        this.ambientLights[`${crypto.randomUUID()}`] = AmbientLight;
      }
    }
    const left_arrow = this.textureLoader.load('/images/textures/icons8-sort-left-48black.png');
    const right_arrow = this.textureLoader.load('/images/textures/icons8-sort-right-48black.png');
    let black_material_right = new THREE.SpriteMaterial({ map: right_arrow });
    let black_material_left = new THREE.SpriteMaterial({ map: left_arrow });
    const left_arrow_white = this.textureLoader.load('/images/textures/icons8-arrow-left.png');
    const right_arrow_white = this.textureLoader.load('/images/textures/icons8-arrow-right.png')
    let white_material_right = new THREE.SpriteMaterial({ map: right_arrow_white });
    let white_material_left = new THREE.SpriteMaterial({ map: left_arrow_white });

    let color = this.item_array[index].product.arrows;
    if (color === "black") {
      this.arrow_r.material = black_material_right;
      this.arrow_l.material = black_material_left;
    }
    else if (color === "white") {
      this.arrow_r.material = white_material_right;
      this.arrow_l.material = white_material_left;
    }

    //Create and add new interest point
    const question_mark_white = this.textureLoader.load('/images/textures/icons8-question-50.png');
    const question_mark_black = this.textureLoader.load('/images/textures/icons8-question-50black.png');

    const white_material = new THREE.SpriteMaterial({ map: question_mark_white });
    const black_material = new THREE.SpriteMaterial({ map: question_mark_black });

    let state = this.item_array[index].product.ip_color;
    //add the interest points
    let interest_points = this.item_array[index].interestPoints;
    if (interest_points.length > 0) {
      for (let interest_point of interest_points) {
        let coordinates = interest_point.XYZ.split(",");
        coordinates = { x: Number(coordinates[0]), y: Number(coordinates[1]), z: Number(coordinates[2]) };
        let ip;
        if (state === "white") { ip = new THREE.Sprite(white_material); }
        else if (state === "black") { ip = new THREE.Sprite(black_material); }
        ip.position.copy(coordinates);

        //interest_point.scale.set()
        let refrence_size = this.item_array[index].product.item_scale;
        let original_scale = this.item_array[index].product.original_scale;

        //calculate scale
        let calculated_scale = (refrence_size / original_scale) - (refrence_size / original_scale) * 0.3;
        ip.scale.set(calculated_scale, calculated_scale, 1);
        let UUID = crypto.randomUUID()
        ip.name = UUID;

        //interest point text 
        ip.text = interest_point.text;

        //ineterest point header
        ip.header = interest_point.header;

        //interest point camera XYZ
        ip.camera_XYZ = interest_point.camera_XYZ.split(",");

        //add to the scene
        this.scene.add(ip);
        this.interest_points[`${UUID}`] = ip;
      }
    }

    //change to color of the menu chevron
    let menu_state = this.item_array[index].product.menu;
    let chevron = document.getElementById("open_icon");
    if (menu_state === "black") { chevron.style.color = "black"; }
    else if (menu_state === "white") { chevron.style.color = "white"; }

    if (callback) { callback() }
  }

  //clear the scene 
  clear_scene() {
    //remove all spotlights 
    if (this.spotlights) {
      for (let key in this.spotlights) {
        this.spotlights[key].remove_spotlight(this.scene);
      }
      this.spotlights = {};
    }

    //remove all ambient lights
    if (this.ambientLights) {
      for (let key in this.ambientLights) {
        this.ambientLights[key].remove_ambient_light(this.scene);
      }
      this.ambientLights = {};
    }

    //remove all interest points
    if (this.interest_points) {
      for (let key in this.interest_points) {
        let sprite = this.interest_points[key];
        if (sprite) {
          this.scene.remove(sprite);
          sprite.material.dispose();
          sprite = null;
        }
      }
    }
  }

  //method to delete an item from the item array
  delete_item(index) {
    if (index >= 0 && index < this.item_array.length) {
      if (this.index === 0 && this.item_array.length === 1) {
        this.clear_scene();
        this.remove_GLB();
        this.index = 0;
        this.item_array = [];
      }
      else if (this.index === index) {
        this.reconstruct_scene(this.index);
      }
      this.item_array.splice(index, 1);
      if (this.index >= this.item_array.length) {
        this.index = this.item_array.length - 1; // Adjust index if it exceeds the new length
      }
    } else {
      console.error("Index out of bounds");
    }
  }
}
export { BasicEditor, CatalogEditor };