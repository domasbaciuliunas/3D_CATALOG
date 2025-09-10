import { BasicEditor } from '/3D_scripts/Editor.js';
import { Pane } from '/tweakpane/tweakpane.js';

/*PRICE*/
//readonly attribute for price
let price = document.getElementById("price");
price.readOnly = true;
price.style.backgroundColor = "lightgrey";
let price_button = document.getElementById("price_button");
price_button.addEventListener("click", function (target) {
    let parent_input = target.srcElement.parentNode.querySelector("input");
    if (parent_input.readOnly) {
        parent_input.readOnly = false;
        parent_input.style.backgroundColor = "";
    } else {
        parent_input.readOnly = true;
        parent_input.style.backgroundColor = "lightgrey";
    }
});

//makes sure the price is not negative 
price.addEventListener("input", function () {
    if (price.value < 0) {
        price.value = 0;
    }
});

/*BACKGROUND*/
//code to change the background
let background = document.getElementById("background");
background.addEventListener("change", (listing) => {
    editor.change_background(listing.target.options[listing.target.selectedIndex].text);
});

/*EDITOR*/
//initialize the editor, resize it, animate it and change the background to black
let editor = new BasicEditor(500, 'canvas_container', { x: 0, y: 0, z: 30 }, 10, 30);
editor.resize();
editor.animate();
editor.change_background("black");

//code to change the color of the arrows
let arrow_checkbox = document.getElementById("arrow_color");
arrow_checkbox.addEventListener('change', function () {
    if (this.checked) {
        editor.change_arrow_color("black");
    } else {
        editor.change_arrow_color("white");
    }
});

/*TWEAKPANE CONTROLS*/
const MAX_TWEAKPANES = 15;
let TWEAKPANE_AMOUNT = 0;

/*EVENT LISTENER TO CHANGE THE MODEL*/
const select = document.getElementById('models');
select.addEventListener("change", async (listing) => {
    let value = listing.target.value;
    editor.remove_GLB();
    editor.add_GLB("/GLB_FILES/", value, DEFAULT_SCALE, () => {
        size_pane.hidden = false;
        PARAMS.Dydis = DEFAULT_SCALE;
        size_pane.refresh();
    });
});

/*MASONRY CODE*/
let masonry;
window.addEventListener('load', () => {
    const grid = document.querySelector('#settings_row');
    masonry = new Masonry(grid, {
        itemSelector: '.col-12',
        percentPosition: true,
    });
});

/*INITIALIZE THE ARRAY*/
function initialize_array(array) {
    for (let x = 1; x <= MAX_TWEAKPANES; x++) {
        array.push(x);
    }
}

/*GET FREE NUMBERS*/
function manage_space(removed, count) {
    let number;
    TWEAKPANE_AMOUNT++;
    if (removed.length > 0) {
        number = Math.min(...removed);
        const index = removed.findIndex(data => data === number);
        if (index !== -1) {
            removed.splice(index, 1);
        }
    } else {
        number = count[0];
        count.shift();
    }
    return number;
}

/*METHOD TO CREATE COLUMN*/
function create_column() {
    let column = document.createElement("div");
    column.classList = "col-12 col-lg-4 col-md-6 col-sm-6 mb-3";
    return column;
}

/*HIDDEN INPUT CREATOR*/
function create_input(name, id) {
    let input_element = document.createElement("INPUT");
    input_element.setAttribute("type", "hidden");
    input_element.id = id;
    input_element.name = name;
    let form = document.getElementById("editor_form");
    form.insertBefore(input_element, form.lastElementChild);
    return input_element;
}

/*REMOVAL CODE*/
function remove_tweakpane(removed, panes, ids, id, column, input_element, number) {
    TWEAKPANE_AMOUNT--;
    removed.push(number);
    delete panes[id];
    column.remove();
    masonry.remove(column);
    masonry.layout();
    input_element.remove();

    // Remove id from ambient_ids
    const idx = ids.indexOf(id);
    if (idx !== -1) {
        ids.splice(idx, 1);
    }
}

//get the settings
let settings = document.getElementById("settings_row");

/*AMBIENT LIGHT MANAGEMENT*/
let ambient_light_panes = {};
let ambient_light_ids = [];
let ambient_count = [];
let removed_ambient = [];

//initialize the max possible ambient_count array
initialize_array(ambient_count);

//function to add an ambient light tweakpane
function create_ambient_light(ambient_light_panes, ambient_light_ids) {
    function update_input_element(input_element, stiprumas, spalva) {
        input_element.value = `{"intensity": ${stiprumas}, "r": ${spalva.r}, "g": ${spalva.g}, "b": ${spalva.b}}`;
    }

    if (TWEAKPANE_AMOUNT < MAX_TWEAKPANES) {
        const PARAMS = { Spalva: { r: 1, g: 1, b: 1 } };
        const INTENSITY = 1;
        const MIN_INTENSITY = 0;
        const MAX_INTENSITY = 20;

        let stiprumas = INTENSITY;
        let spalva = PARAMS["Spalva"];

        let number = manage_space(removed_ambient, ambient_count);
        let column = create_column();
        let id = crypto.randomUUID();
        ambient_light_ids.push(id);
        let input_element = create_input("ambient", id);
        update_input_element(input_element, stiprumas, spalva);
        ambient_light_panes[id] = new Pane({
            container: column
        });
        const folder = ambient_light_panes[id].addFolder({
            title: `Supanti_šviesa_${number}`,
            expanded: true,
        });
        folder.on('fold', () => {
            setTimeout(() => {
                masonry.layout();
            }, 200);
        });
        folder.addBlade({
            view: 'slider',
            label: 'Stiprumas',
            min: MIN_INTENSITY,
            max: MAX_INTENSITY,
            value: INTENSITY,
        }).on('change', (ev) => {
            editor.change_ambient_light_intensity(ev.value, id);
            stiprumas = ev.value;
            update_input_element(input_element, stiprumas, spalva);
        });
        folder.addBinding(PARAMS, 'Spalva', {
            color: {
                type: 'float'
            },
        }).on('change', (ev) => {
            editor.change_ambient_light_color(ev.value, id);
            spalva = ev.value
            update_input_element(input_element, stiprumas, spalva);
        });
        const btn = ambient_light_panes[id].addButton({
            title: 'Ištrinti',
            label: 'Veiksmas',
        }).on('click', () => {
            editor.remove_ambient_light(id);
            remove_tweakpane(removed_ambient, ambient_light_panes, ambient_light_ids, id, column, input_element, number);
        });
        editor.add_ambient_light("white", INTENSITY, id)
        settings.appendChild(column);
        masonry.appended(column);
        masonry.layout();
    }
}
/*SPOTLIGHT MANAGEMENT*/
let spotlight_panes = {};
let spotlight_ids = [];
let spotlight_count = [];
let removed_spotlights = [];

//initialize the max possible spotlight_count
initialize_array(spotlight_count);

//function to add an ambient light tweakpane
function create_spotlight(spotlight_panes, spotlight_ids) {
    function update_input_element(input_element, stiprumas, atstumas, penumbra, kampas, spalva, koordinates) {
        input_element.value = `{"intensity": ${stiprumas}, "distance": ${atstumas}, "penumbra": ${penumbra}, "angle": ${kampas}, "r": ${spalva.r}, "g": ${spalva.g}, "b": ${spalva.b}, "x":${koordinates.x}, "y":${koordinates.y}, "z":${koordinates.z}}`;
    }

    if (TWEAKPANE_AMOUNT < MAX_TWEAKPANES) {
        const PARAMS = { Spalva: { r: 1, g: 1, b: 1 }, Koordinatės: { x: 0, y: 10, z: 0 } };
        const INTENSITY = 1000;
        const MIN_INTENSITY = 0;
        const MAX_INTENSITY = 3000;
        const MIN_DISTANCE = 0;
        const MAX_DISTANCE = 100;
        const MIN_PENUMBRA = 0;
        const MAX_PENUMBRA = 1;
        const MIN_ANGLE = 0;
        const MAX_ANGLE = 90;
        const DISTANCE = 0;
        const PENUMBRA = 0;
        const ANGLE = 90;

        let koordinates = PARAMS["Koordinatės"];
        let spalva = PARAMS["Spalva"];
        let stiprumas = INTENSITY;
        let atstumas = DISTANCE;
        let penumbra = PENUMBRA;
        let kampas = ANGLE;

        let number = manage_space(removed_spotlights, spotlight_count);
        let column = create_column();
        let id = crypto.randomUUID();
        spotlight_ids.push(id);
        let input_element = create_input("spotlight", id);
        update_input_element(input_element, stiprumas, atstumas, penumbra, kampas, spalva, koordinates);
        spotlight_panes[id] = new Pane({
            container: column
        })
        const folder = spotlight_panes[id].addFolder({
            title: `Prožektorius_${number}`,
            expanded: true,
        });
        folder.on('fold', () => {
            setTimeout(() => {
                masonry.layout();
            }, 200);
        });
        folder.addBlade({
            view: 'slider',
            label: 'Stiprumas',
            min: MIN_INTENSITY,
            max: MAX_INTENSITY,
            value: INTENSITY,
        }).on('change', (ev) => {
            editor.change_spotlight_intensity(ev.value, id);
            stiprumas = ev.value;
            update_input_element(input_element, stiprumas, atstumas, penumbra, kampas, spalva, koordinates);
        });
        folder.addBinding(PARAMS, 'Spalva', {
            color: {
                type: 'float'
            },
        }).on('change', (ev) => {
            editor.change_spotlight_color(ev.value, id);
            spalva = ev.value;
            update_input_element(input_element, stiprumas, atstumas, penumbra, kampas, spalva, koordinates);
        });
        folder.addBinding(PARAMS, 'Koordinatės').on('change', (ev) => {
            editor.change_spotlight_coordinates(ev.value, id);
        });
        folder.addBlade({
            view: 'slider',
            label: 'Atstumas',
            min: MIN_DISTANCE,
            max: MAX_DISTANCE,
            value: DISTANCE,
        }).on('change', (ev) => {
            editor.change_spotlight_distance(ev.value, id);
            atstumas = ev.value;
            update_input_element(input_element, stiprumas, atstumas, penumbra, kampas, spalva, koordinates);
        });
        folder.addBlade({
            view: 'slider',
            label: 'Penumbra',
            min: MIN_PENUMBRA,
            max: MAX_PENUMBRA,
            value: PENUMBRA,
        }).on('change', (ev) => {
            editor.change_spotlight_penumbra(ev.value, id);
            penumbra = ev.value;
            update_input_element(input_element, stiprumas, atstumas, penumbra, kampas, spalva, koordinates);
        });
        folder.addBlade({
            view: 'slider',
            label: 'Kampas',
            min: MIN_ANGLE,
            max: MAX_ANGLE,
            value: ANGLE,
        }).on('change', (ev) => {
            editor.change_spotlight_angle(ev.value, id);
            kampas = ev.value;
            update_input_element(input_element, stiprumas, atstumas, penumbra, kampas, spalva, koordinates);
        });
        const btn = spotlight_panes[id].addButton({
            title: 'Ištrinti',
            label: 'Veiksmas',
        }).on('click', () => {
            remove_tweakpane(removed_spotlights, spotlight_panes, spotlight_ids, id, column, input_element, number);
            editor.remove_spotlight(id);
        });
        editor.add_spotlight("white", INTENSITY, DISTANCE, Math.PI / 2, PENUMBRA, { x: 0, y: 10, z: 0 }, id);
        settings.appendChild(column);
        masonry.appended(column);
        masonry.layout();
    }
}
/*INTEREST POINT MANAGEMENT*/

let ip_color_state = false;
//code to change the color of the interest points
let ip_color = document.getElementById("ip_color");
ip_color.addEventListener("change", function () {
    if (this.checked) {
        ip_color_state = true;
        editor.change_interestpoint_color("black");
    } else {
        ip_color_state = false;
        editor.change_interestpoint_color("white");
    }
});

let interest_point_panes = {};
let interest_point_ids = [];
let interest_point_count = [];
let removed_interest_points = [];
let interest_point_params = {};

//initialize the max possible interest_point_count
initialize_array(interest_point_count)
function create_interest_point(interest_point_panes, interest_point_ids) {
    function update_input_element(input_element, koordinates, tekstas, antraste, camera_pos) {
        input_element.value = `{"x": ${koordinates.x}, "y": ${koordinates.y}, "z": ${koordinates.z}, "text": "${tekstas}", "header" : "${antraste}", "camera_x" : ${camera_pos.x}, "camera_y" : ${camera_pos.y}, "camera_z" : ${camera_pos.z}}`;
    }
    const PARAMS = { Koordinatės: { x: 0, y: 0, z: 0 } };
    const TEKSTAS = "Įveskite tekstą";
    const ANTRASTE = "Įveskite antraštę";

    let tekstas = TEKSTAS;
    let antraste = ANTRASTE;
    let koordinates = PARAMS["Koordinatės"];
    let kameros_pozicija = { "x": 0, "y": 0, "z": 30 };

    let number = manage_space(removed_interest_points, interest_point_count);
    let column = create_column();
    let id = crypto.randomUUID();
    interest_point_ids.push(id);
    let input_element = create_input("interest_point", id);
    update_input_element(input_element, koordinates, tekstas, antraste, kameros_pozicija);
    interest_point_panes[id] = new Pane({ container: column });
    interest_point_params[id] = { PARAMS };
    interest_point_params[id].antraste = antraste;
    interest_point_params[id].tekstas = tekstas;

    const folder = interest_point_panes[id].addFolder({
        title: `Dėmesio_taškas_${number}`,
        expanded: true,
    });
    folder.on('fold', () => {
        setTimeout(() => {
            masonry.layout();
        }, 200);
    });
    folder.addBinding(PARAMS, 'Koordinatės', {
        disabled: true
    });
    folder.addBlade({
        view: 'text',
        label: 'Antraštė',
        parse: (v) => String(v),
        value: 'Įveskite antraštę',
    }).on("change", (ev) => {
        antraste = ev.value
        interest_point_params[id].antraste = antraste;
        update_input_element(input_element, koordinates, tekstas, antraste, kameros_pozicija);
    });
    folder.addBlade({
        view: 'text',
        label: 'Tekstas',
        parse: (v) => String(v),
        value: 'Įveskite tekstą',
    }).on("change", (ev) => {
        tekstas = ev.value
        interest_point_params[id].tekstas = tekstas;
        update_input_element(input_element, koordinates, tekstas, antraste, kameros_pozicija);
    });
    const cast_ray = folder.addButton({
        title: 'Nustatyti',
        label: 'Pozicija',
    }).on('click', () => {
        editor.Create_interestPoint(id, (coords) => {
            PARAMS["Koordinatės"].x = coords.x;
            PARAMS["Koordinatės"].y = coords.y;
            PARAMS["Koordinatės"].z = coords.z;
            koordinates = PARAMS["Koordinatės"];
            kameros_pozicija = editor.get_camera_position();
            interest_point_params[id].PARAMS.kameros_pozicija = kameros_pozicija;
            update_input_element(input_element, koordinates, tekstas, antraste, kameros_pozicija);
            interest_point_panes[id].refresh();
        }, ip_color_state);

    });
    const btn = interest_point_panes[id].addButton({
        title: 'Ištrinti',
        label: 'Veiksmas',
    }).on('click', () => {
        editor.Delete_InterestPoint(id);
        delete interest_point_params[id];
        remove_tweakpane(removed_interest_points, interest_point_panes, interest_point_ids, id, column, input_element, number)
    });
    settings.appendChild(column);
    masonry.appended(column);
    masonry.layout();
}

/*SCALE MANAGEMENT*/

//Default size parameters for the scale tweakpane
const OBJECT_SCALE_MAX = 20;
const OBJECT_SCALE_MIN = 1;
const DEFAULT_SCALE = 5;

//gets the hidden forms
let scale_form = document.getElementById("scale_form");
let original_scale = document.getElementById("original_scale");

//creates the params for the tweakpane
const PARAMS = {
    Dydis: DEFAULT_SCALE
};

//writes the size to the hidden forms
original_scale.value = PARAMS["Dydis"];
scale_form.value = PARAMS["Dydis"];

//creates a new tweakpane called size_pane, sets the container as "settings" dom element
let settings_div = document.getElementById('settings')
let size_pane = new Pane({
    container: settings_div
});

//adds the size binding with min and max set to the const values
size_pane.addBinding(PARAMS, 'Dydis', {
    min: OBJECT_SCALE_MIN,
    max: OBJECT_SCALE_MAX,
}).on('change', (ev) => {
    //changes the value of the element
    editor.change_size(ev["value"]);
    //sets the scale inside the form
    scale_form.value = `${ev["value"]}`;
    document.querySelectorAll('input[name="interest_point"]').forEach(input => {
        const id = input.id;
        const interestPoint = editor.get_InterestPoint(id);
        if (interestPoint && interest_point_params[id]) {
            interest_point_params[id].PARAMS.Koordinatės.x = interestPoint.position.x;
            interest_point_params[id].PARAMS.Koordinatės.y = interestPoint.position.y;
            interest_point_params[id].PARAMS.Koordinatės.z = interestPoint.position.z;
            interest_point_panes[id].refresh();

            // Update the hidden input value
            const input_element = document.getElementById(id);
            const koordinates = interest_point_params[id].PARAMS.Koordinatės;
            const tekstas = interest_point_params[id].tekstas || '';
            const antraste = interest_point_params[id].antraste || '';
            const kameros_pozicija = editor.getCameraPosition();
            input_element.value = `{"x": ${koordinates.x}, "y": ${koordinates.y}, "z": ${koordinates.z}, "text": "${tekstas}", "header" : "${antraste}", "camera_x" : ${kameros_pozicija.x}, "camera_y" : ${kameros_pozicija.y}, "camera_z" : ${kameros_pozicija.z}}`;
            interest_point_panes[id].refresh();
        }
    });
});

//hides the size_pane
size_pane.hidden = true;
//adds an event listener for the ambient_button
let ambient_button = document.getElementById("ambient");
ambient_button.addEventListener("click", () => {
    create_ambient_light(ambient_light_panes, ambient_light_ids);
});
//adds an event listener for the spotlight_button
let spotlight_button = document.getElementById("spotlight");
spotlight_button.addEventListener("click", () => {
    create_spotlight(spotlight_panes, spotlight_ids);
});
//adds an event listener for the ambient_button
let Interest_button = document.getElementById("interest_point");
Interest_button.addEventListener("click", () => {
    create_interest_point(interest_point_panes, interest_point_ids);
});
