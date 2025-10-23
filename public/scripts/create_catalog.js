import { CatalogEditor } from '/3D_scripts/Editor.js';
import { Pane } from '/tweakpane/tweakpane.js';

/*ABOUT SECTION*/
//hide the about section
let about = document.getElementById("about");
about.style.display = 'none';

//event listener to close the about section
document.getElementById('close_about').addEventListener('click', () => {
    about.style.display = 'none';
});

/*DESCRIPTION*/
//opening and closing the description
let open_icon = document.getElementById('open_icon');
let description = document.getElementById("desc");
let description_div = document.querySelector("#desc div");

//open the description
description.style.display = 'none';
document.getElementById('open_icon').addEventListener('click', () => {
    description.style.display = 'block';
    open_icon.style.display = 'none';
    about.style.display = 'none';
});

//show the icon after closing the description
document.getElementById('close_icon').addEventListener('click', () => {
    description.style.display = 'none';
    open_icon.style.display = 'block';
})

/*NAVIGATION*/
//build the navigation dropdown
function build_navigation() {
    let navigation = document.getElementById("navigation");
    let items = editor.get_items();
    navigation.innerHTML = "";
    for (let item of items) {
        let option = document.createElement("option");
        option.value = item.id;
        option.text = editor.find_by_id(item.id);
        navigation.appendChild(option);
    }
}

//navigate to the selected item
document.getElementById('navigate_button').addEventListener('click', () => {
    let navigation = document.getElementById("navigation");
    let selected_id = navigation.value;
    let current_index = editor.find_by_id(selected_id);
    editor.set_current_index(current_index);
    editor.reconstruct_scene(current_index);
});

/*CATALOG EDITOR*/
//import the CatalogEditor class from the Editor.js file
let editor = new CatalogEditor(500, 'canvas_container', { x: 0, y: 0, z: 30 }, 10, 30);
editor.resize();
editor.animate();
editor.add_page_event_listener();

/*TWEAKPANE CONTROLS*/
const MAX_TWEAKPANES = 15;
let TWEAKPANE_AMOUNT = 0;

/*MASONRY CODE*/
let masonry;
const grid = document.querySelector('#settings_row');
masonry = new Masonry(grid, {
    itemSelector: '.col-12',
    percentPosition: true,
});

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
function remove_tweakpane(input_element, folders, panes, ids, id, column) {
    TWEAKPANE_AMOUNT--;
    delete panes[id];
    delete folders[id];
    column.remove();
    masonry.remove(column);
    masonry.layout();

    // Remove id from ambient_ids
    const idx = ids.indexOf(id);
    if (idx !== -1) {
        ids.splice(idx, 1);
        input_element.splice(idx, 1);
    }
}

/*INITIALIZE THE ARRAY*/
function initialize_array(array) {
    for (let x = 1; x <= MAX_TWEAKPANES; x++) {
        array.push(x);
    }
}

//get the settings
let settings = document.getElementById("settings_row");

/*PRODUCT FUNCTION MANAGAEMENT*/
let available_tweakpanes = [];
let tweakpane_ids = [];
let tweakpanes = {};
let folders = {};
let product_ids = [];

let product_input = create_input("product_input", "products_input");
initialize_array(available_tweakpanes);
/*PRODUCT FUNCTION*/
// Add event listener to the select button
function add_product(optional_id, optional_name) {

    //get the product selector
    let productSelect = document.getElementById('products');
    let selectedProduct = optional_id ? optional_id : productSelect.value;
    let product_name = optional_name ? optional_name : productSelect.options[productSelect.selectedIndex].text;

    function update_input_element(product_id) {
        product_ids.push(product_id);
        product_input.value = JSON.stringify(product_ids);
    }

    if (TWEAKPANE_AMOUNT < MAX_TWEAKPANES) {
        let column = create_column();
        let id = crypto.randomUUID();
        tweakpane_ids.push(id);
        tweakpanes[id] = new Pane({
            container: column
        });
        let folder = tweakpanes[id].addFolder({
            title: `${product_name}`,
            expanded: true,
        });
        folders[id] = folder;
        folder.on('fold', () => {
            setTimeout(() => {
                masonry.layout();
            }, 200);
        });
        const btn = tweakpanes[id].addButton({
            title: 'Ištrinti',
            label: 'Veiksmas',
        }).on('click', () => {
            current_index = editor.find_by_id(id);
            editor.delete_item(current_index);
            update_list();
            build_navigation();
            remove_tweakpane(product_ids, folders, tweakpanes, tweakpane_ids, id, column);
            product_input.value = JSON.stringify(product_ids);
        });
        //load the product into the editor
        editor.load_resource(window.spotlights[selectedProduct],
            window.ambient_lights[selectedProduct],
            window.interest_points[selectedProduct],
            window.models[selectedProduct][0],
            window.cubemaps[selectedProduct],
            window.keyed_products[selectedProduct],
            id,
            optional_name ? optional_name : productSelect.options[productSelect.selectedIndex].text
        );

        //load the description
        let parsed_data = window.keyed_products[selectedProduct];
        description_div.innerHTML = parsed_data["description"];
        let price = document.createElement("h3");
        price.innerText = 'Kaina: ' + parsed_data["price"] + ' €';
        description_div.appendChild(price);

        //find and set the current index
        let current_index = editor.find_by_id(id);
        editor.set_current_index(current_index);

        //reconstruct the scene to show the newly added product
        TWEAKPANE_AMOUNT++;
        editor.reconstruct_scene(current_index);
        update_input_element(selectedProduct);
        update_list();
        build_navigation()
        settings.appendChild(column);
        masonry.appended(column);
        masonry.layout();
    }
}

/*ITEM MANIPULATION*/
//dynamically add and update the options in the select element with the current items in the editor
function update_list() {
    let items = editor.get_items();
    let old_items = document.getElementById("items_old");
    let new_items = document.getElementById("items_new");
    old_items.innerHTML = "";
    new_items.innerHTML = "";
    for (let item of items) {
        let option = document.createElement("option");
        option.value = item.id;
        option.text = item.name + "[" + editor.find_by_id(item.id) + "]";
        folders[item.id].title = item.name + "[" + editor.find_by_id(item.id) + "]";
        old_items.appendChild(option);
        items_new.appendChild(option.cloneNode(true));
    }
}

//switch places of two selected items
document.getElementById('change_button').addEventListener('click', () => {
    editor.switch_places(document.getElementById("items_old").value, document.getElementById("items_new").value);
    update_list();
});

function add_title_pane(optional_title, optional_color, optional_black_letters) {
    function update_input_element(input_element, antraste, spalva, juodos_raides) {
        input_element.value = `{"antraste": "${antraste}", "r": ${spalva.r}, "g": ${spalva.g}, "b": ${spalva.b}, "juodos_raides": "${juodos_raides}"}`;
    }
    //add a tweakpane for the header color
    let settings = document.getElementById("settings_row");
    let column = create_column();
    let input_element = create_input("title", "title_input");
    const pane = new Pane({ container: column });
    const PARAMS = { Spalva: { r: 255, g: 255, b: 255 }, Juodos_raides: false };

    let antraste = optional_title ? optional_title : "Įveskite antraštę";
    let spalva = optional_color ? optional_color["Spalva"] : PARAMS.Spalva;
    let juodos_raides = optional_black_letters ? optional_black_letters.Juodos_raides : PARAMS.Juodos_raides

    update_input_element(input_element, antraste, spalva, juodos_raides);
    const folder = pane.addFolder({
        title: `Viršelis`,
        expanded: true,
    });
    folder.on('fold', () => {
        setTimeout(() => {
            masonry.layout();
        }, 200);
    });
    folder.addBlade({
        view: 'text',
        label: 'Antraštė',
        parse: (v) => String(v),
        value: antraste,
    }).on('change', (ev) => {
        antraste = ev.value;
        update_input_element(input_element, antraste, spalva, juodos_raides)
    })
    folder.addBinding(optional_color ? optional_color : PARAMS, 'Spalva').on("change", (ev) => {
        spalva = ev.value;
        update_input_element(input_element, antraste, spalva, juodos_raides)
    });
    folder.addBinding(optional_black_letters ? optional_black_letters : PARAMS, 'Juodos_raides').on('change', (ev) => {
        juodos_raides = ev.value;
        update_input_element(input_element, antraste, spalva, juodos_raides)
    });
    settings.appendChild(column);
    masonry.appended(column);
    masonry.layout();
}

/*EVENT LISTENERS*/
let product_button = document.getElementById('product_button')
let productSelect = document.getElementById('products');
product_button.addEventListener('click', () => {
    if (productSelect.value) {
        add_product();
    }
});
window.addEventListener('load', () => {

    //loading operations for the editing procedures
    let selected_products = window.selected_products;
    let catalog_data = window.catalog_data;

    if (selected_products && catalog_data) {
        catalog_data.RGB = catalog_data.RGB.split(",");
        catalog_data.RGB = { Spalva: { r: Number(catalog_data.RGB[0]), g: Number(catalog_data.RGB[1]), b: Number(catalog_data.RGB[2]) } };
        let black_letters = { Juodos_raides: catalog_data.DARK_LETTERS == "black" ? true : false };
        console.log(black_letters);
        add_title_pane(catalog_data.CATALOG_NAME, catalog_data.RGB, black_letters);
        //load the products into the catalog editor
        for (let product of selected_products) {
            add_product(product["PRODUCT_ID"], product["name"]);
        }
    }
    else {
        add_title_pane();
    }

});

