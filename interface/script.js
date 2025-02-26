let ville_select = document.getElementById('ville');
let submit_btn = document.getElementById('submit');
const villes = [ 
    "Casablanca",
    "Rabat",
    "Fes",
    "Marrakech",
    "Tangier",
    "Agadir",
    "Meknes",
    "Oujda",
    "Kenitra",
    "Tetouan",
    "Safi",
    "Mohammedia",
    "El Jadida",
    "Nador",
    "Beni Mellal",
    "Taza",
    "Laayoune",
    "Dakhla",
    "Essaouira",
    "Al Hoceima",
    "Settat",
    "Ksar El Kebir",
    "Tiznit",
    "Errachidia",
    "Guercif",
    "Sidi Kacem",
    "Taourirt",
    "Sidi Slimane",
    "Azrou",
    "Ouarzazate",
    "Tan-Tan",
    "Guelmim",
    "Smara",
    "Larache",
    "Midelt",
    "Zagora",
    "Chefchaouen",
    "Khouribga",
    "El Kelaa des Sraghna",
    "Berkane",
    "Ifrane",
    "Martil",
    "Fnideq",
    "Temara",
    "Ait Melloul",
    "Ouazzane",
    "Imzouren",
    "Sefrou",
    "Boujdour",
    "Chichaoua",
    "Azemmour",
    "Aourir",
    "Bir Jdid",
    "Taroudant",
    "Ait Ourir",
    "Demnate",
    "Oulad Teima",
    "Skhirat",
    "Tinghir",
    "Bouarfa",
    "Khémisset",
    "Jorf El Melha",
    "Laayoune-Plage"
];

villes.forEach((ville, n) => {
    add_ville_option(ville, n);
});

submit_btn.addEventListener('click', () => {
    submit_data();
});

function add_ville_option(villeNom, value) {
    let ville_option = document.createElement("option");
    ville_option.textContent = villeNom;
    ville_option.setAttribute("value", value);
    ville_select.appendChild(ville_option);
}


const noteInputs = document.querySelectorAll('#note_nat, #note_reg, #note_gen');
const ageInput = document.getElementById('age');

function validateNumberInput(input, min, max) {
    input.addEventListener('input', function() {
        const value = parseFloat(this.value);
        
        if (value > max) {
            this.value = max;
            alert(`La valeur maximale autorisée est ${max}`);
        }
        if (value < min) {
            this.value = min;
            alert(`La valeur minimale autorisée est ${min}`);
        }
    });
}

noteInputs.forEach(input => {
    validateNumberInput(input, 0, 20);
});

validateNumberInput(ageInput, 0, 100);

document.getElementById('submit').addEventListener('click', function(e) {
    let hasError = false;
    // valider no9ta
    noteInputs.forEach(input => {
        const value = parseFloat(input.value);
        if (value < 0 || value > 20 || isNaN(value)) {
            hasError = true;
            alert(`${input.previousElementSibling.textContent} doit être entre 0 et 20`);
        }
    });
    
    // valider l age
    const ageValue = parseFloat(ageInput.value);
    if (ageValue < 0 || ageValue > 100 || isNaN(ageValue)) {
        hasError = true;
        alert("L'âge doit être entre 0 et 100");
    }
    
    if (hasError) {
        e.preventDefault();
    }
});

function submit_data() {
    const userData = {
        age: document.getElementById('age').value,
        specialite: document.getElementById('specialite').value,
        sexe: document.getElementById('sexe').value,
        ville: document.getElementById('ville').value,
        niveau_anglais: document.getElementById('niveau_anglais').value,
        niveau_francais: document.getElementById('niveau_francais').value,
        note_nat: document.getElementById('note_nat').value,
        note_reg: document.getElementById('note_reg').value,
        note_gen: document.getElementById('note_gen').value,
        matiere_detestee: document.getElementById('matiere_detestee').value,
        loisirs: Array.from(document.querySelectorAll('input[name="loisirs"]:checked')).map(el => el.value),
        matiere_preferee: document.getElementById('matiere_preferee').value,
        specialite1: document.getElementById('specialite1').value,
        soft_skills: Array.from(document.querySelectorAll('input[name="soft_skills"]:checked')).map(el => el.value),
    };

    fetch('http://localhost:5000/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => response.json())
    .then(data => alert(data.message)) 
    .catch(error => console.error('Error:', error)); 
}