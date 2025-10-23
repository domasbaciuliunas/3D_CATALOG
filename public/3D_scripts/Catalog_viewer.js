import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Editor, ambientLight, spotLight } from '/3D_scripts/Editor.js';


class CatalogViewer extends Editor {
    constructor(view_height, section_id, camera_position, min_zoom, max_zoom) {
        super(view_height, section_id, camera_position, min_zoom, max_zoom);
        this.item_array = [];
        this.interest_points = {}
        this.ambientLights = {};
        this.spotlights = {}
        this.index = 0;
        this.about = document.getElementById("about_viewer");
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2()
        this.cubeTextureLoader = new THREE.CubeTextureLoader();
    }

    resize() {
        window.addEventListener('resize', () => {
            let width = this.get_section_size();
            this.renderer.setSize(width, window.innerHeight);
            this.camera.aspect = width / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.domElement.style.width = "100%";
            this.renderer.domElement.style.height = `${window.innerHeight}px`;
            this.arrow_r.position.set(7 * this.section.getBoundingClientRect().width / window.innerHeight, 0, -20)
            this.arrow_l.position.set(- 7 * this.section.getBoundingClientRect().width / window.innerHeight, 0, -20);
        });
    }

    load_items(products) {
        this.item_array = products;
    }

    reconstruct_scene(index, callback) {
        let open_icon = document.getElementById('open_icon_viewer');
        let description = document.getElementById("Description_viewer");

        description.style.display = 'none';
        open_icon.style.display = 'block';

        //load the GLB
        this.remove_GLB();
        this.clear_scene();
        this.add_GLB("/GLB_FILES/", this.item_array[index].model[0]["GLB_ID"], this.item_array[index].item_scale);
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

        //add the ambient lights
        let ambient_lights = this.item_array[index].ambient_lights;
        if (ambient_lights.length > 0) {
            for (let ambient_light of ambient_lights) {
                let ambient_light_colors = ambient_light.RGB.split(",");
                ambient_light_colors = { r: Number(ambient_light_colors[0]), g: Number(ambient_light_colors[1]), b: Number(ambient_light_colors[2]) };
                let AmbientLight = new ambientLight("white", ambient_light.intensity);
                let ambColor = new THREE.Color(`rgb(${ambient_light_colors.r}, ${ambient_light_colors.g}, ${ambient_light_colors.b})`);
                AmbientLight.ambientLight.color.set(ambColor);
                AmbientLight.add_to_scene(this.scene);
                this.ambientLights[`${crypto.randomUUID()}`] = AmbientLight;
            }
        }

        //add the spotlights
        let spotlights = this.item_array[index].spotlights;
        if (spotlights.length > 0) {
            for (let spotlight of spotlights) {
                let spotlight_position = spotlight.XYZ.split(",");
                spotlight_position = { x: Number(spotlight_position[0]), y: Number(spotlight_position[1]), z: Number(spotlight_position[2]) };
                let spotlight_colors = spotlight.RGB.split(",");
                spotlight_colors = { r: Number(spotlight_colors[0]), g: Number(spotlight_colors[1]), b: Number(spotlight_colors[2]) };
                const pi = Math.PI;
                let radians = spotlight.angle * (pi / 180);
                let SpotLight = new spotLight("white", spotlight.intensity, spotlight.distance, radians, spotlight.penumbra, spotlight_position);
                let spotColor = new THREE.Color(`rgb(${spotlight_colors.r}, ${spotlight_colors.g}, ${spotlight_colors.b})`);
                SpotLight.spotLight.color.set(spotColor);
                SpotLight.add_to_scene(this.scene);
                this.spotlights[`${crypto.randomUUID()}`] = SpotLight;
            }
        }


        //arrow color
        const left_arrow = this.textureLoader.load('/images/textures/icons8-sort-left-48black.png');
        const right_arrow = this.textureLoader.load('/images/textures/icons8-sort-right-48black.png');
        let black_material_right = new THREE.SpriteMaterial({ map: right_arrow });
        let black_material_left = new THREE.SpriteMaterial({ map: left_arrow });
        const left_arrow_white = this.textureLoader.load('/images/textures/icons8-arrow-left.png');
        const right_arrow_white = this.textureLoader.load('/images/textures/icons8-arrow-right.png')
        let white_material_right = new THREE.SpriteMaterial({ map: right_arrow_white });
        let white_material_left = new THREE.SpriteMaterial({ map: left_arrow_white });

        let color = this.item_array[index].arrows;
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

        let state = this.item_array[index].ip_color;

        //add the interest points
        let interest_points = this.item_array[index].interest_points;
        if (interest_points.length > 0) {
            for (let interest_point of interest_points) {
                let coordinates = interest_point.XYZ.split(",");
                coordinates = { x: Number(coordinates[0]), y: Number(coordinates[1]), z: Number(coordinates[2]) };
                let ip;
                if (state === "white") { ip = new THREE.Sprite(white_material); }
                else if (state === "black") { ip = new THREE.Sprite(black_material); }
                ip.position.copy(coordinates);

                //interest_point.scale.set()
                let refrence_size = this.item_array[index].item_scale;
                let original_scale = this.item_array[index].original_scale;

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
        if (callback) { callback(); }
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

    //add the page event
    add_page_event_listener() {
        this.renderer.domElement.addEventListener('click', (event) => this.page_event(event));
    }

    render_desc() {
        let open_icon = document.getElementById('open_icon_viewer');
        let description = document.getElementById("Description_viewer");
        let description_div = document.querySelector("#Description_viewer div");

        this.reconstruct_scene(this.index, () => {
            if (this.item_array[this.index].menu === "black") {
                document.getElementById("open_icon_viewer").style.color = "black";
            } else {
                document.getElementById("open_icon_viewer").style.color = "white";
            }
            document.getElementById("title_viewer").innerText = this.item_array[this.index].name;
            if (this.item_array[this.index].title_color === "black") {
                document.getElementById("title_viewer").style.color = "black";
            } else {
                document.getElementById("title_viewer").style.color = "white";
            }
        });
        let parsed_data = this.item_array[this.index];
        description_div.innerHTML = parsed_data["description"];
        let price = document.createElement("h3");
        if (parsed_data["price"]) {
            price.innerText = 'Kaina: ' + parsed_data["price"] + ' €';
            description_div.appendChild(price);
        }
        this.about.style.display = "none";
        description.style.display = 'none';
        open_icon.style.display = 'block';
    }

    navigate_intersection(name) {
        this.about.style.display = "block";
        document.getElementById("headers").innerText = "";
        document.getElementById("paragraphs").innerHTML = ""; // Clear previous content
        document.getElementById("headers").innerText = this.interest_points[name].header
        let div = document.getElementById("paragraphs");
        div.innerHTML = this.interest_points[name].text;
        let camera_coords = this.interest_points[name].camera_XYZ;
        let camera_position = {
            "x": Number(camera_coords[0]),
            "y": Number(camera_coords[1]),
            "z": Number(camera_coords[2])
        }
        this.camera.position.set(camera_position["x"], camera_position["y"], camera_position["z"]);
    }

    page_event(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj.name == `Rightarrow` && this.index < this.item_array.length - 1) {
                this.index = this.index + 1;
                this.render_desc();
            }
            if (obj.name == `Leftarrow` && this.index > 0) {
                this.index = this.index - 1;
                this.render_desc();
            }
            if (intersects[1]) {
                const obj_2 = intersects[1].object;
                if (this.interest_points[obj.name]) {
                    this.navigate_intersection(obj.name);
                }
                else if (this.interest_points[obj_2.name]) {
                    this.navigate_intersection(obj_2.name);
                }
            }
        }
    }

    get_item_array_size() {
        return this.item_array.length;
    }

    navigate_to(number) {
        if( number >=0  && number < this.item_array.length){
            this.index = number;
            this.render_desc();
        }
    }
}

export { CatalogViewer }