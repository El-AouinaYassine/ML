const { exec } = require('child_process');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const { parse } = require('csv-parse/sync');
const app = express();
const port = 3000;
const CSV_FILE_PATH = './interface/Backend/data.csv';

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
  '4': 'Courant'
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
const SPECIALITE_MAP1 = {
  '1': 'Réseaux et télécommunication',
  '2': 'Statistique et informatique décisionnelle',
  '3': 'Génie mécanique et productique',
  '4': 'Génie électrique',
  '5': 'Génie des procédés',
  '6': 'Gestion des ressources humaines',
  '7': 'Technique de gestion commerciale',
  '8': 'Technique de management',
  '9': 'Gestion logistique et transport',
  '10': 'Génie thermique et énergétique',
  '11': 'Génie Informatique',
  '12': 'Génie industriel et maintenance'
};
app.use(cors());
app.use(bodyParser.json());

function createWriter() {
  // Always create a new file (no append option = overwrite)
  return createCsvWriter({
    path: CSV_FILE_PATH,
    header: [
      { id: 'age', title: 'Age' },
      { id: 'specialite', title: 'specialite_BAC' },
      { id: 'sexe', title: 'Sexe' },
      { id: 'ville', title: 'ville' },
      { id: 'niveau_anglais', title: 'Anglais' },
      { id: 'niveau_francais', title: 'Francais' },
      { id: 'note_nat', title: 'Nationale' },
      { id: 'note_reg', title: 'regional' },
      { id: 'note_gen', title: 'General' },
      { id: 'matiere_detestee', title: 'deteste' },
      { id: 'loisirs', title: 'loisirs' },
      { id: 'matiere_preferee', title: 'preferee' },
      { id: 'specialite1', title: 'specialite' },
      { id: 'soft_skills', title: 'skills' }
    ]
    // Removed append option - this will always overwrite
  });
}

// Transform numerical data to text
function transformData(userData) {
  return {
      age: userData.age,
      specialite: userData.specialite, // Use "SM" directly
      sexe: SEXE_MAP[userData.sexe] || '',
      ville: VILLES[userData.ville] || '',
      niveau_anglais: NIVEAU_LANGUE_MAP[userData.niveau_anglais] || '',
      niveau_francais: NIVEAU_LANGUE_MAP[userData.niveau_francais] || '',
      note_nat: userData.note_nat,
      note_reg: userData.note_reg,
      note_gen: userData.note_gen,
      matiere_detestee: userData.matiere_detestee, // Use "Mathematiques" directly
      loisirs: userData.loisirs.join(', '), // Join "Lecture, Sport" directly
      matiere_preferee: userData.matiere_preferee, // Use "Physique" directly
      specialite1: userData.specialite1, // Use "Informatique" directly
      soft_skills: userData.soft_skills.join(', ') // Join "Creativite, Communication" directly
  };
}

app.post('/submit', async (req, res) => {
  try {
    const userData = req.body;
    const formattedData = transformData(userData);
    
    // Create CSV writer - will overwrite existing file
    const csvWriter = createWriter();

    // Write the data
    await csvWriter.writeRecords([formattedData]);
    
    res.json({ message: 'Data submitted and saved to CSV (overwritten if existed)' });

    exec('./.venv/bin/python ./script/data_preprocessing/clean_website.py', (error, stdout, stderr) => {
      if(error){
        console.error(`error=>${error}`)
      }
    });
    exec('./.venv/bin/python ./testing/prediction.py ', (error, stdout, stderr) => {
      if(error){
        console.error(`error=>${error}`)
      }
    });
    
  } catch (error) {
    console.error('Error writing to CSV:', error);
    res.status(500).json({ message: 'Error saving data to CSV' });
  }
});
app.get('/result', async (req, res) => {
    const csvFilePath = 'predictions.csv'
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const records = parse(csvData, { columns: true, trim: true });
    console.log('CSV Records:', records);
    const lastRow = records[0];
    const satisfactio_performance = Object.values(lastRow).slice(-3,-1);
    console.log("-------------------")
    console.log(satisfactio_performance)
    console.log("-------------------")
    res.status(200).json({result:satisfactio_performance})
})
app.get('/getTopThree' , async (req,  res)=>{
  const csvFilePath = 'predictions.csv'
  const csvData = fs.readFileSync(csvFilePath, 'utf8');
  const records = parse(csvData, { columns: true, trim: true });
  console.log('CSV Records:', records);
  const first = Object.values(records[1]).slice(-4,-1);
  const second = Object.values(records[2]).slice(-4,-1);
  const third = Object.values(records[3]).slice(-4,-1);
  // const satisfactio_performance = Object.values(lastRow).slice(-3,-1);
  res.status(200).json({result:[first,second,third]})
})
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});