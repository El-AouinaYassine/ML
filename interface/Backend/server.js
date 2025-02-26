
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');

const app = express();
const port = 5000;
const CSV_FILE_PATH = 'data.csv';

// Data mappings
const SPECIALITE_MAP = {
  '1': 'SM',
  '2': 'SVT',
  '3': 'SA',
  '4': 'SP',
  '5': 'STE',
  '6': 'STM',
  '7': 'SE',
  '8': 'SGC',
  '9': 'Lettres',
  '10': 'SH'
};

const SEXE_MAP = {
  '0': 'Homme',
  '1': 'Femme'
};

const VILLES = [
  "Casablanca", "Rabat", "Fes", "Marrakech", "Tangier", "Agadir", "Meknes",
  "Oujda", "Kenitra", "Tetouan", "Safi", "Mohammedia", "El Jadida", "Nador",
  "Beni Mellal", "Taza", "Laayoune", "Dakhla", "Essaouira", "Al Hoceima",
  "Settat", "Ksar El Kebir", "Tiznit", "Errachidia", "Guercif", "Sidi Kacem",
  "Taourirt", "Sidi Slimane", "Azrou", "Ouarzazate", "Tan-Tan", "Guelmim",
  "Smara", "Larache", "Midelt", "Zagora", "Chefchaouen", "Khouribga",
  "El Kelaa des Sraghna", "Berkane", "Ifrane", "Martil", "Fnideq", "Temara",
  "Ait Melloul", "Ouazzane", "Imzouren", "Sefrou", "Boujdour", "Chichaoua",
  "Azemmour", "Aourir", "Bir Jdid", "Taroudant", "Ait Ourir", "Demnate",
  "Oulad Teima", "Skhirat", "Tinghir", "Bouarfa", "Khemisset", "Jorf El Melha",
  "Laayoune-Plage"
];

const NIVEAU_LANGUE_MAP = {
  '1': 'Debutant',
  '2': 'Intermediaire',
  '3': 'Avance',
  '4': 'Fluent'
};

const MATIERE_MAP = {
  '0': 'None',
  '1': 'Mathematiques',
  '2': 'Physique',
  '3': 'Chimie',
  '4': 'Litterature',
  '5': 'Histoire',
  '6': 'Langues',
  '7': 'Informatique',
  '8': 'Biologie'
};

const LOISIRS_MAP = {
  '1': 'Lecture',
  '2': 'Sport',
  '3': 'Musique',
  '4': 'Voyage',
  '5': 'Cinema',
  '6': 'Jeuxvideo',
  '7': 'Artsplastiques',
  '8': 'Benevolat',
  '9': 'Technologie',
  '10': 'Ecriture',
  '11': 'Photographie'
};

const SOFT_SKILLS_MAP = {
  '1': 'Adaptabilite',
  '2': 'Creativite',
  '3': 'Resolutiondeproblemes',
  '4': 'Autonomie',
  '5': 'Espritcritique',
  '6': 'Leadership',
  '7': 'Empathie',
  '8': 'Ecouteactive',
  '9': 'Gestiondustress',
  '10': 'Communication',
  '11': 'Gestiondutemps',
  '12': 'Travailenequipe'
};
const SPECIALITE1_MAP = {
  '1': 'Informatisue',
  '2': 'Ingenierie',
  '3': 'Medecine',
  '4': 'Droit',
  '5': 'Mathematiques appliquees',
  '6': 'Physique',
  '7': 'Economie',
  '8': 'Architecture'
};

app.use(cors());
app.use(bodyParser.json());

function createWriter(append = false) {
  return createCsvWriter({
    path: CSV_FILE_PATH,
    header: [
      { id: 'age', title: 'Age' },
      { id: 'specialite', title: 'specialite_BAC' },
      { id: 'sexe', title: 'Sexe' },
      { id: 'ville', title: 'Ville' },
      { id: 'niveau_anglais', title: 'Anglais' },
      { id: 'niveau_francais', title: 'Francais' },
      { id: 'note_nat', title: 'Nationale' },
      { id: 'note_reg', title: 'Regional' },
      { id: 'note_gen', title: 'Generale' },
      { id: 'matiere_detestee', title: 'detestee' },
      { id: 'loisirs', title: 'Loisirs' },
      { id: 'matiere_preferee', title: 'preferee' },
      { id: 'specialite1', title: 'specialite' },
      { id: 'soft_skills', title: 'Skills' }
    ],
    append: append
  });
}

// Transform numerical data to text
function transformData(userData) {
  return {
    age: userData.age,
    specialite: SPECIALITE_MAP[userData.specialite] || '',
    sexe: SEXE_MAP[userData.sexe] || '',
    ville: VILLES[userData.ville] || '',
    niveau_anglais: NIVEAU_LANGUE_MAP[userData.niveau_anglais] || '',
    niveau_francais: NIVEAU_LANGUE_MAP[userData.niveau_francais] || '',
    note_nat: userData.note_nat,
    note_reg: userData.note_reg,
    note_gen: userData.note_gen,
    matiere_detestee: MATIERE_MAP[userData.matiere_detestee] || '',
    loisirs: userData.loisirs.map(id => LOISIRS_MAP[id]).filter(Boolean).join(', '),
    matiere_preferee: MATIERE_MAP[userData.matiere_preferee] || '',
    specialite1: SPECIALITE1_MAP[userData.specialite1] || '',
    soft_skills: userData.soft_skills.map(id => SOFT_SKILLS_MAP[id]).filter(Boolean).join(', ')
  };
}

app.post('/submit', async (req, res) => {
  try {
    const userData = req.body;
    const formattedData = transformData(userData);
    
    // Check if file exists
    const fileExists = fs.existsSync(CSV_FILE_PATH);
    
    // Create CSV writer with appropriate append setting
    const csvWriter = createWriter(fileExists);

    // Write the data
    await csvWriter.writeRecords([formattedData]);
    
    res.json({ message: 'Data submitted and saved to CSV' });
  } catch (error) {
    console.error('Error writing to CSV:', error);
    res.status(500).json({ message: 'Error saving data to CSV' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
