import pandas as pd

def convert_boolean_columns(df):
    """
    Convert TRUE/FALSE values to 1/0 in a DataFrame, but only for columns that contain boolean values.
    Other columns are left unchanged.
    
    Parameters:
    -----------
    df : pandas.DataFrame
        The input DataFrame to process
        
    Returns:
    --------
    pandas.DataFrame
        A new DataFrame with boolean columns converted to 1/0 integers
    """
    # Create a copy to avoid modifying the original DataFrame
    df_copy = df.copy()
    
    # Iterate through each column
    for column in df_copy.columns:
        # Get unique values in the column
        unique_values = set(df_copy[column].dropna().unique())
        
        # Check if the column only contains TRUE/FALSE values (ignoring NaN)
        if unique_values.issubset({True, False}) or unique_values.issubset({'TRUE', 'FALSE', 'True', 'False'}):
            # Convert string boolean values to actual boolean values first
            if df_copy[column].dtype == 'object':
                df_copy[column] = df_copy[column].map({'TRUE': True, 'FALSE': False, 
                                                      'True': True, 'False': False})
            
            # Convert boolean values to integers
            df_copy[column] = df_copy[column].astype(int)
    
    return df_copy
CATEGORIES = {
    'Ville': [
        'agadir', 'ain taoujdate', 'alhoceima', 'azrou', 'benguerir',
        'beni mellal', 'berkane', 'casa', 'el hajeb', 'fes', 'fez', 'fès',
        'immouzzer', 'khenifra', 'khouribga', 'ksar el kebir', 'larache',
        'marrakech', 'meknes', 'midelt', 'mohammedia', 'mrirt', 'nador',
        'ouazzane', 'ouezzane', 'oujda', 'qatar', 'rabat', 'rich', 'safi',
        'sale', 'sefrou', 'sidi slimane', 'tanger', 'tantan', 'taourirt',
        'taroudant', 'taza', 'tetouan'
    ],
    'specialite_BAC': [
        'Lettres', 'SE', 'SGC', 'SH', 'SM', 'SP', 'STE', 'STM', 'SVT'
    ],
    'Sexe': ['Femme', 'Homme'],
    'specialite': [
        'Informatique', 'Ingenierie', 'Medecine', 'Mathematiques appliquees', 'Droit',
        'Physique', 'Economie', 'Architecture', 'Sciences humaines et sociales', 'Histoire',
        'Arts et design', 'Education', 'Langues étrangeres', 'Geographie', 'Sciences politiques',
        'Biologie', 'Chimie', 'Logistique', 'Reseau', 'Infirmerie'
    ],
    'Loisirs': [
        'chess', 'Lecture', 'Sport', 'Musique', 'Voyage', 'Cinema', 'Jeuxvideo',
        'Artsplastiques', 'Benevolat', 'Technologie', 'Ecriture', 'Photographie'
    ],
    'Skills': [
        'Communication', 'Travailenequipe', 'Gestiondutemps', 'Adaptabilite', 'Creativite',
        'Resolutiondeproblemes', 'Leadership', 'Empathie', 'Espritcritique', 'Autonomie'
    ],
    'detestee': [
        'Mathematiques', 'Physique', 'Chimie', 'Litterature', 'Histoire',
        'Langues', 'Informatique', 'Biologie'
    ],
    'preferee': [
        'Mathematiques', 'Physique', 'Chimie', 'Litterature', 'Histoire',
        'Langues', 'Informatique', 'Biologie'
    ]
}

LANGUAGE_MAPPING = {
    'Débutant': 1,
    'Intermédiaire': 2,
    'Avancé': 3,
    'Courant': 4,
    'Avance': 3
}

def convert_language(value):
    return LANGUAGE_MAPPING.get(value.strip(), 2)

def process_comma_column(series, categories, prefix):
    processed = series.fillna('').str.strip().str.lower().str.replace(' ', '_')
    exploded = processed.str.split(',').explode().str.strip()
    exploded = exploded[exploded != '']
    # Create categorical series while preserving the index
    exploded = pd.Series(
        pd.Categorical(exploded.values, categories=categories),
        index=exploded.index
    )
    dummies = pd.get_dummies(exploded, prefix=prefix)
    result = dummies.groupby(level=0).max().fillna(0).astype(int)
    return result

def process_csv(input_file, output_file):
    df = pd.read_csv(input_file, dtype=str, keep_default_na=False)
    
    # Process numerical columns
    numerical_cols = df[['Age', 'Nationale', 'Regional', 'Generale']]
    # Convert language levels to numeric
    df['Francais'] = df['Francais'].apply(lambda x: convert_language(x))
    df['Anglais'] = df['Anglais'].apply(lambda x: convert_language(x))
    
    # Process categorical columns
    sexe = pd.Categorical(df['Sexe'], categories=CATEGORIES['Sexe'])
    sexe_dummies = pd.get_dummies(sexe, prefix='Sexe')
    
    ville = pd.Categorical(df['Ville'], categories=CATEGORIES['Ville'])
    ville_dummies = pd.get_dummies(ville, prefix='Ville')
    
    bac = pd.Categorical(df['specialite_BAC'], categories=CATEGORIES['specialite_BAC'])
    bac_dummies = pd.get_dummies(bac, prefix='specialite_BAC')
    
    # Process comma-separated columns
    preferee = process_comma_column(df['preferee'], CATEGORIES['preferee'], 'preferee')
    detestee = process_comma_column(df['detestee'], CATEGORIES['detestee'], 'detestee')
    # specialite = process_comma_column(df['specialite'], CATEGORIES['specialite'], 'specialite')
    loisirs = process_comma_column(df['Loisirs'], CATEGORIES['Loisirs'], 'Loisir')
    skills = process_comma_column(df['Skills'], CATEGORIES['Skills'], 'Skill')
    
    # Combine all DataFrames
    result = pd.concat([
        numerical_cols,
        df[['Francais', 'Anglais']],
        preferee,
        detestee,
        specialite,
        ville_dummies,
        sexe_dummies,
        bac_dummies,
        loisirs,
        skills
    ], axis=1)
    result = convert_boolean_columns(result)
    # Save to CSV
    result.to_csv(output_file, index=False)

if __name__ == "__main__":
    process_csv('interface/Backend/data.csv', 'outpu2t.csv')