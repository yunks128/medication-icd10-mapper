import React, { useState, useMemo } from 'react';
import { Search, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';

const ICD10ToRXGenerator = () => {
  const [inputCodes, setInputCodes] = useState('');
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Common ICD-10 to RX code mappings based on medical practice
  const icd10ToRxMappings = {
    // Diabetes
    'E11.9': ['68645', '68646', '68647'], // Type 2 diabetes - Metformin, Insulin, Glipizide
    'E10.9': ['68646', '68648', '68649'], // Type 1 diabetes - Insulin, Lantus, Humalog
    'E11.65': ['68645', '68650'], // Type 2 diabetes with hyperglycemia
    'E11.00': ['68645', '68646'], // Type 2 diabetes with hyperosmolarity
    
    // Hypertension
    'I10': ['68720', '68721', '68722'], // Essential hypertension - Lisinopril, Amlodipine, Losartan
    'I11.9': ['68720', '68723'], // Hypertensive heart disease
    'I12.9': ['68720', '68724'], // Hypertensive kidney disease
    'I25.10': ['68725', '68726', '68720'], // Coronary artery disease - Metoprolol, Atorvastatin, Lisinopril
    'I48.91': ['68727', '68728'], // Atrial fibrillation - Warfarin, Apixaban
    'I50.9': ['68747', '68748', '70008'], // Heart failure - Digoxin, Spironolactone, Furosemide
    
    // Hyperlipidemia
    'E78.5': ['68800', '68801', '68802'], // Hyperlipidemia - Atorvastatin, Simvastatin, Rosuvastatin
    'E78.0': ['68800', '68803'], // Pure hypercholesterolemia
    'E78.2': ['68804', '68805'], // Mixed dyslipidemia
    
    // Depression/Anxiety
    'F32.9': ['69100', '69101', '69102'], // Major depressive disorder - Sertraline, Fluoxetine, Escitalopram
    'F41.1': ['69101', '69103', '69104'], // Generalized anxiety disorder
    'F33.9': ['69100', '69105'], // Recurrent depressive disorder
    'F41.9': ['69103', '69115', '69116'], // Anxiety disorder - Lorazepam, Alprazolam, Clonazepam
    'F20.9': ['69122', '69123', '69124'], // Schizophrenia - Risperidone, Quetiapine, Olanzapine
    'F31.9': ['69128', '69129', '69130'], // Bipolar disorder - Lithium, Valproic acid, Lamotrigine
    'F90.9': ['69132', '69133', '69134'], // ADHD - Methylphenidate, Amphetamines, Atomoxetine
    'G47.00': ['69119', '69120', '69136'], // Insomnia - Zolpidem, Eszopiclone, Trazodone
    
    // Respiratory
    'J45.9': ['69200', '69201', '69202'], // Asthma - Albuterol, Fluticasone, Montelukast
    'J44.1': ['69200', '69203'], // COPD with exacerbation
    'J44.0': ['69200', '69203'], // COPD with infection
    'J06.9': ['69250', '69251'], // Upper respiratory infection - Amoxicillin, Azithromycin
    'J30.9': ['69234', '69235', '69236'], // Allergic rhinitis - Loratadine, Cetirizine, Fexofenadine
    'R05': ['69230', '69231', '69232'], // Cough - Dextromethorphan, Codeine, Guaifenesin
    'R06.00': ['69233', '69234', '69235'], // Dyspnea - Diphenhydramine, Loratadine, Cetirizine
    
    // Pain Management
    'M25.50': ['69300', '69301'], // Joint pain - Ibuprofen, Naproxen
    'M54.5': ['69300', '69302', '69303'], // Low back pain - NSAIDs, Acetaminophen, Cyclobenzaprine
    'G43.9': ['69350', '69351'], // Migraine - Sumatriptan, Topiramate
    'G43.109': ['69350', '69352', '69353'], // Migraine with aura - Sumatriptan, Rizatriptan, Zolmitriptan
    'G89.29': ['69317', '69319', '69320'], // Chronic pain - Tramadol, Hydrocodone, Oxycodone
    'G89.3': ['69321', '69322'], // Cancer pain - Morphine, Fentanyl
    'M79.3': ['69300', '69301'], // Panniculitis - NSAIDs
    'M79.1': ['69303', '69313'], // Myalgia - Cyclobenzaprine, Methocarbamol
    
    // Cardiovascular (continued)
    'I47.1': ['70021', '70022', '70023'], // Supraventricular tachycardia - Amiodarone, Flecainide, Propafenone
    'I49.9': ['70021', '70024'], // Cardiac arrhythmia - Amiodarone, Sotalol
    'I20.9': ['70017', '70018', '70019'], // Angina - Isosorbide mononitrate, Isosorbide dinitrate, Nitroglycerin
    'I26.99': ['70027', '70028', '70029'], // Pulmonary embolism - Heparin, Enoxaparin, Fondaparinux
    'I73.9': ['70001'], // Peripheral vascular disease - Clopidogrel
    
    // Gastrointestinal
    'K21.9': ['69400', '69401'], // GERD - Omeprazole, Pantoprazole
    'K59.00': ['69402'], // Constipation - Docusate
    'K30': ['69403'], // Dyspepsia - Famotidine
    'K25.9': ['69400', '69411'], // Gastric ulcer - Omeprazole, Sucralfate
    'K58.9': ['69419', '69420'], // Irritable bowel syndrome - Dicyclomine, Hyoscyamine
    'R11.10': ['69427', '69428'], // Vomiting - Ondansetron, Promethazine
    'R11.11': ['69427', '69429'], // Vomiting without nausea - Ondansetron, Metoclopramide
    
    // Endocrine
    'E03.9': ['69500', '69501'], // Hypothyroidism - Levothyroxine, Synthroid
    'E05.90': ['69502'], // Hyperthyroidism - Methimazole
    'E27.1': ['69527', '69528'], // Adrenocortical insufficiency - Prednisone, Prednisolone
    'E28.2': ['69504', '69727'], // Polycystic ovarian syndrome - Estradiol, Contraceptives
    'E29.1': ['69510', '69511'], // Testicular hypofunction - Testosterone gel, Testosterone injection
    'M80.00': ['69518', '69519', '70006'], // Osteoporosis - Alendronate, Risedronate, Vitamin D
    'M81.0': ['69518', '70006'], // Osteoporosis without fracture - Alendronate, Vitamin D
    'E55.9': ['70006'], // Vitamin D deficiency - Vitamin D
    
    // Dermatologic
    'L30.9': ['69600', '69601'], // Dermatitis - Hydrocortisone, Triamcinolone
    'L70.0': ['69602', '69603'], // Acne - Tretinoin, Clindamycin
    'L70.9': ['69602', '69610', '69612'], // Acne unspecified - Tretinoin, Adapalene, Benzoyl peroxide
    'L20.9': ['69600', '69604'], // Atopic dermatitis - Hydrocortisone, Betamethasone
    'L23.9': ['69600', '69608'], // Allergic contact dermatitis - Hydrocortisone, Desonide
    
    // Infectious Diseases
    'A49.9': ['69250', '69251'], // Bacterial infection - Amoxicillin, Azithromycin
    'B37.9': ['69275'], // Candidiasis - Fluconazole
    'B37.3': ['69275', '69276'], // Vaginal candidiasis - Fluconazole, Nystatin
    'L03.90': ['69252', '69256'], // Cellulitis - Cephalexin, Clindamycin
    'N39.0': ['69253', '69268'], // UTI - Ciprofloxacin, Nitrofurantoin
    'N30.90': ['69704', '69705'], // Cystitis - Nitrofurantoin, Fosfomycin
    'A41.9': ['69269', '69270'], // Sepsis - Vancomycin, Linezolid
    'B35.9': ['69281'], // Dermatophytosis - Terbinafine
    'B00.9': ['69283', '69284'], // Herpes simplex - Acyclovir, Valacyclovir
    'H66.90': ['69250', '69273'], // Otitis media - Amoxicillin, Ofloxacin otic
    
    // Genitourinary
    'N40.1': ['69707', '69709'], // BPH with LUTS - Finasteride, Tamsulosin
    'N40.0': ['69707', '69708'], // BPH without LUTS - Finasteride, Dutasteride
    'N39.41': ['69714', '69715'], // Urge incontinence - Oxybutynin, Tolterodine
    'N39.498': ['69716', '69720'], // Other incontinence - Solifenacin, Mirabegron
    'N52.9': ['69722', '69723'], // Erectile dysfunction - Sildenafil, Tadalafil
    'N52.01': ['69722', '69724'], // ED due to arterial insufficiency - Sildenafil, Vardenafil
    'N91.2': ['69727', '69504'], // Amenorrhea - Contraceptives, Estradiol
    'Z30.9': ['69727', '69728'], // Contraceptive management - Combined OCs, Progestin-only
    
    // Hematologic
    'D50.9': ['70005'], // Iron deficiency anemia - Iron supplement
    'D51.9': ['70005'], // B12 deficiency anemia - Iron/B12 supplement
    'Z79.01': ['68727', '68728'], // Long term anticoagulant use - Warfarin, Apixaban
    
    // Ophthalmologic
    'H40.10X1': ['70090', '70091'], // Open-angle glaucoma - Timolol, Latanoprost
    'H40.9': ['70092', '70093'], // Unspecified glaucoma - Brimonidine, Dorzolamide
    'H10.9': ['69274'], // Conjunctivitis - Ciprofloxacin ophthalmic
    
    // Metabolic/Nutritional
    'E16.2': ['70032'], // Hypoglycemia - Glucagon
    'E15': ['70032'], // Hypoglycemic coma - Glucagon
    
    // Emergency/Critical Care
    'R57.0': ['70035', '70036', '70037'], // Cardiogenic shock - Norepinephrine, Epinephrine, Dopamine
    'R57.2': ['70035', '70038'], // Septic shock - Norepinephrine, Dobutamine
    'I26.90': ['70027', '70030'], // Septic pulmonary embolism - Heparin, Argatroban
    
    // Smoking cessation
    'Z87.891': ['69105'], // Personal history of nicotine dependence - Bupropion
    'F17.210': ['69105'], // Nicotine dependence - Bupropion
    
    // Autoimmune/Rheumatologic
    'M06.9': ['70004', '69333'], // Rheumatoid arthritis - Methotrexate
    'M05.9': ['70004', '69333'], // Seropositive RA - Methotrexate
    
    // Cancer-related
    'C78.00': ['70010'], // Secondary lung malignancy - Morphine
    'R06.02': ['70010'], // Shortness of breath - Morphine (palliative)
    
    // Renal
    'N18.6': ['70009'], // End stage renal disease - Epoetin
    'I12.9': ['70009'], // Hypertensive kidney disease - Epoetin
    
    // Hepatic
    'K76.0': ['70007'], // Fatty liver - Lactulose
    'K72.90': ['70007'], // Hepatic failure - Lactulose
  };

  // RX code database with descriptions
  const rxCodeDatabase = {
    // Diabetes medications
    '68645': 'Metformin 500mg',
    '68646': 'Insulin (various)',
    '68647': 'Glipizide 5mg',
    '68648': 'Lantus (Insulin glargine)',
    '68649': 'Humalog (Insulin lispro)',
    '68650': 'Januvia (Sitagliptin)',
    
    // Cardiovascular medications  
    '68720': 'Lisinopril 10mg',
    '68721': 'Amlodipine 5mg',
    '68722': 'Losartan 50mg',
    '68723': 'Carvedilol 25mg',
    '68724': 'Hydralazine 25mg',
    '68725': 'Metoprolol 50mg',
    '68726': 'Atorvastatin 20mg',
    '68727': 'Warfarin 5mg',
    '68728': 'Apixaban 5mg',
    '68747': 'Digoxin 0.25mg',
    '68748': 'Spironolactone 25mg',
    
    // Cholesterol medications
    '68800': 'Atorvastatin 20mg',
    '68801': 'Simvastatin 20mg',
    '68802': 'Rosuvastatin 10mg',
    '68803': 'Pravastatin 40mg',
    '68804': 'Fenofibrate 145mg',
    '68805': 'Gemfibrozil 600mg',
    
    // Mental health medications
    '69100': 'Sertraline 50mg',
    '69101': 'Fluoxetine 20mg',
    '69102': 'Escitalopram 10mg',
    '69103': 'Lorazepam 1mg',
    '69104': 'Buspirone 15mg',
    '69105': 'Bupropion 150mg',
    '69115': 'Alprazolam 0.5mg',
    '69116': 'Clonazepam 1mg',
    '69119': 'Zolpidem 10mg',
    '69120': 'Eszopiclone 3mg',
    '69122': 'Risperidone 2mg',
    '69123': 'Quetiapine 100mg',
    '69124': 'Olanzapine 10mg',
    '69128': 'Lithium 300mg',
    '69129': 'Valproic acid 250mg',
    '69130': 'Lamotrigine 100mg',
    '69132': 'Methylphenidate 18mg',
    '69133': 'Amphetamine/Dextroamphetamine 20mg',
    '69134': 'Atomoxetine 40mg',
    '69136': 'Trazodone 50mg',
    
    // Respiratory medications
    '69200': 'Albuterol inhaler',
    '69201': 'Fluticasone inhaler',
    '69202': 'Montelukast 10mg',
    '69203': 'Spiriva inhaler',
    '69230': 'Dextromethorphan 15mg',
    '69231': 'Codeine 15mg',
    '69232': 'Guaifenesin 400mg',
    '69233': 'Diphenhydramine 25mg',
    '69234': 'Loratadine 10mg',
    '69235': 'Cetirizine 10mg',
    '69236': 'Fexofenadine 180mg',
    '69250': 'Amoxicillin 500mg',
    '69251': 'Azithromycin 250mg',
    
    // Pain medications
    '69300': 'Ibuprofen 600mg',
    '69301': 'Naproxen 500mg',
    '69302': 'Acetaminophen 500mg',
    '69303': 'Cyclobenzaprine 10mg',
    '69313': 'Methocarbamol 750mg',
    '69317': 'Tramadol 50mg',
    '69319': 'Hydrocodone 5mg',
    '69320': 'Oxycodone 5mg',
    '69321': 'Morphine 15mg',
    '69322': 'Fentanyl 25mcg/hr',
    '69333': 'Methotrexate 15mg',
    '69350': 'Sumatriptan 50mg',
    '69351': 'Topiramate 50mg',
    '69352': 'Rizatriptan 10mg',
    '69353': 'Zolmitriptan 2.5mg',
    
    // GI medications
    '69400': 'Omeprazole 20mg',
    '69401': 'Pantoprazole 40mg',
    '69402': 'Docusate 100mg',
    '69403': 'Famotidine 20mg',
    '69411': 'Sucralfate 1g',
    '69419': 'Dicyclomine 20mg',
    '69420': 'Hyoscyamine 0.375mg',
    '69427': 'Ondansetron 8mg',
    '69428': 'Promethazine 25mg',
    '69429': 'Metoclopramide 10mg',
    
    // Endocrine medications
    '69500': 'Levothyroxine 50mcg',
    '69501': 'Synthroid 75mcg',
    '69502': 'Methimazole 10mg',
    '69504': 'Estradiol 1mg',
    '69510': 'Testosterone gel 1%',
    '69511': 'Testosterone injection 200mg',
    '69518': 'Alendronate 70mg',
    '69519': 'Risedronate 35mg',
    '69527': 'Prednisone 20mg',
    '69528': 'Prednisolone 15mg',
    
    // Dermatologic medications
    '69600': 'Hydrocortisone 1% cream',
    '69601': 'Triamcinolone 0.1% cream',
    '69602': 'Tretinoin 0.025% gel',
    '69603': 'Clindamycin 1% gel',
    '69604': 'Betamethasone 0.1% cream',
    '69608': 'Desonide 0.05% cream',
    '69610': 'Adapalene 0.1% gel',
    '69612': 'Benzoyl peroxide 2.5% gel',
    
    // Antibiotics/Antifungals
    '69252': 'Cephalexin 500mg',
    '69253': 'Ciprofloxacin 500mg',
    '69256': 'Clindamycin 300mg',
    '69268': 'Nitrofurantoin 100mg',
    '69269': 'Vancomycin IV',
    '69270': 'Linezolid 600mg',
    '69273': 'Ofloxacin otic 0.3%',
    '69274': 'Ciprofloxacin ophthalmic 0.3%',
    '69275': 'Fluconazole 150mg',
    '69276': 'Nystatin 100,000 units',
    '69281': 'Terbinafine 250mg',
    '69283': 'Acyclovir 400mg',
    '69284': 'Valacyclovir 1g',
    
    // Genitourinary medications
    '69704': 'Nitrofurantoin 100mg',
    '69705': 'Fosfomycin 3g',
    '69707': 'Finasteride 5mg',
    '69708': 'Dutasteride 0.5mg',
    '69709': 'Tamsulosin 0.4mg',
    '69714': 'Oxybutynin 5mg',
    '69715': 'Tolterodine 2mg',
    '69716': 'Solifenacin 5mg',
    '69720': 'Mirabegron 25mg',
    '69722': 'Sildenafil 50mg',
    '69723': 'Tadalafil 10mg',
    '69724': 'Vardenafil 10mg',
    '69727': 'Combined oral contraceptives',
    '69728': 'Progestin-only pills',
    
    // Specialty medications
    '70001': 'Clopidogrel 75mg',
    '70004': 'Methotrexate 15mg',
    '70005': 'Iron supplement 325mg',
    '70006': 'Vitamin D 2000 IU',
    '70007': 'Lactulose 15ml',
    '70008': 'Furosemide 40mg',
    '70009': 'Epoetin alfa',
    '70010': 'Morphine 15mg',
    '70017': 'Isosorbide mononitrate 30mg',
    '70018': 'Isosorbide dinitrate 20mg',
    '70019': 'Nitroglycerin 0.4mg SL',
    '70021': 'Amiodarone 200mg',
    '70022': 'Flecainide 100mg',
    '70023': 'Propafenone 150mg',
    '70024': 'Sotalol 80mg',
    '70027': 'Heparin IV',
    '70028': 'Enoxaparin 40mg',
    '70029': 'Fondaparinux 2.5mg',
    '70030': 'Argatroban IV',
    '70032': 'Glucagon 1mg',
    '70035': 'Norepinephrine IV',
    '70036': 'Epinephrine 1mg',
    '70037': 'Dopamine IV',
    '70038': 'Dobutamine IV',
    '70090': 'Timolol eye drops 0.5%',
    '70091': 'Latanoprost 0.005%',
    '70092': 'Brimonidine 0.2%',
    '70093': 'Dorzolamide 2%',
  };

  const processInputCodes = () => {
    const codes = inputCodes.split(/[\n,;]/).map(code => code.trim().toUpperCase()).filter(code => code);
    const processedResults = [];

    codes.forEach(icdCode => {
      const matchingRxCodes = icd10ToRxMappings[icdCode] || [];
      
      if (matchingRxCodes.length > 0) {
        const rxDetails = matchingRxCodes.map(rxCode => ({
          code: rxCode,
          description: rxCodeDatabase[rxCode] || 'Description not available'
        }));
        
        processedResults.push({
          icdCode,
          status: 'found',
          rxCodes: rxDetails,
          condition: getConditionFromICD(icdCode)
        });
      } else {
        // Generate suggested RX codes based on ICD pattern
        const suggestedRx = generateSuggestedRxCodes(icdCode);
        processedResults.push({
          icdCode,
          status: 'suggested',
          rxCodes: suggestedRx,
          condition: getConditionFromICD(icdCode)
        });
      }
    });

    setResults(processedResults);
  };

  const getConditionFromICD = (icdCode) => {
    const conditionMap = {
      'E11': 'Type 2 Diabetes Mellitus',
      'E10': 'Type 1 Diabetes Mellitus',
      'I10': 'Essential Hypertension',
      'I11': 'Hypertensive Heart Disease',
      'I12': 'Hypertensive Kidney Disease',
      'I25': 'Chronic Ischemic Heart Disease',
      'I48': 'Atrial Fibrillation and Flutter',
      'I50': 'Heart Failure',
      'I47': 'Paroxysmal Tachycardia',
      'I49': 'Other Cardiac Arrhythmias',
      'I20': 'Angina Pectoris',
      'I26': 'Pulmonary Embolism',
      'I73': 'Other Peripheral Vascular Diseases',
      'E78': 'Disorders of Lipoprotein Metabolism',
      'F32': 'Major Depressive Episodes',
      'F41': 'Other Anxiety Disorders',
      'F33': 'Recurrent Depressive Disorder',
      'F20': 'Schizophrenia',
      'F31': 'Bipolar Affective Disorder',
      'F90': 'Hyperkinetic Disorders',
      'G47': 'Sleep Disorders',
      'J45': 'Asthma',
      'J44': 'Chronic Obstructive Pulmonary Disease',
      'J06': 'Acute Upper Respiratory Infections',
      'J30': 'Vasomotor and Allergic Rhinitis',
      'R05': 'Cough',
      'R06': 'Abnormalities of Breathing',
      'M25': 'Other Joint Disorder',
      'M54': 'Dorsalgia',
      'G43': 'Migraine',
      'G89': 'Pain, not elsewhere classified',
      'M79': 'Other and unspecified soft tissue disorders',
      'K21': 'Gastro-esophageal Reflux Disease',
      'K59': 'Other Functional Intestinal Disorders',
      'K30': 'Functional Dyspepsia',
      'K25': 'Gastric Ulcer',
      'K58': 'Irritable Bowel Syndrome',
      'R11': 'Nausea and Vomiting',
      'E03': 'Other Hypothyroidism',
      'E05': 'Thyrotoxicosis',
      'E27': 'Other Disorders of Adrenal Gland',
      'E28': 'Ovarian Dysfunction',
      'E29': 'Testicular Dysfunction',
      'M80': 'Osteoporosis with Current Pathological Fracture',
      'M81': 'Osteoporosis without Current Pathological Fracture',
      'E55': 'Vitamin D Deficiency',
      'L30': 'Other Dermatitis',
      'L70': 'Acne',
      'L20': 'Atopic Dermatitis',
      'L23': 'Allergic Contact Dermatitis',
      'A49': 'Bacterial Infection',
      'B37': 'Candidiasis',
      'L03': 'Cellulitis',
      'N39': 'Other Disorders of Urinary System',
      'N30': 'Cystitis',
      'A41': 'Other Sepsis',
      'B35': 'Dermatophytosis',
      'B00': 'Herpesviral Infections',
      'H66': 'Suppurative and Unspecified Otitis Media',
      'N40': 'Benign Prostatic Hyperplasia',
      'N52': 'Male Erectile Dysfunction',
      'N91': 'Absent, Scanty and Rare Menstruation',
      'Z30': 'Encounter for Contraceptive Management',
      'D50': 'Iron Deficiency Anemia',
      'D51': 'Vitamin B12 Deficiency Anemia',
      'Z79': 'Long Term Drug Therapy',
      'H40': 'Glaucoma',
      'H10': 'Conjunctivitis',
      'E16': 'Other Disorders of Pancreatic Internal Secretion',
      'E15': 'Nondiabetic Hypoglycemic Coma',
      'R57': 'Shock, not elsewhere classified',
      'Z87': 'Personal History of Other Diseases',
      'F17': 'Mental and Behavioral Disorders due to Use of Tobacco',
      'M06': 'Other Rheumatoid Arthritis',
      'M05': 'Rheumatoid Arthritis with Rheumatoid Factor',
      'C78': 'Secondary Malignant Neoplasm of Respiratory and Digestive Organs',
      'N18': 'Chronic Kidney Disease',
      'K76': 'Other Diseases of Liver',
      'K72': 'Hepatic Failure'
    };

    const prefix = icdCode.substring(0, 3);
    return conditionMap[prefix] || 'Condition not specified';
  };

  const generateSuggestedRxCodes = (icdCode) => {
    // Generate suggested RX codes based on ICD-10 category
    const category = icdCode.charAt(0);
    const prefix = icdCode.substring(0, 3);
    const defaultRx = [];

    // More specific suggestions based on ICD-10 prefixes
    if (prefix.startsWith('E1')) { // Diabetes
      defaultRx.push({ code: '68645', description: 'Metformin 500mg (suggested)' });
    } else if (prefix.startsWith('I1') || prefix.startsWith('I2') || prefix.startsWith('I4') || prefix.startsWith('I5')) { // Cardiovascular
      defaultRx.push({ code: '68720', description: 'Lisinopril 10mg (suggested)' });
    } else if (prefix.startsWith('E7')) { // Lipid disorders
      defaultRx.push({ code: '68800', description: 'Atorvastatin 20mg (suggested)' });
    } else if (prefix.startsWith('F3') || prefix.startsWith('F4')) { // Depression/Anxiety
      defaultRx.push({ code: '69100', description: 'Sertraline 50mg (suggested)' });
    } else if (prefix.startsWith('J4') || prefix.startsWith('J3') || prefix.startsWith('R0')) { // Respiratory
      defaultRx.push({ code: '69200', description: 'Albuterol inhaler (suggested)' });
    } else if (prefix.startsWith('M2') || prefix.startsWith('M5') || prefix.startsWith('G4') || prefix.startsWith('G8')) { // Pain
      defaultRx.push({ code: '69300', description: 'Ibuprofen 600mg (suggested)' });
    } else if (prefix.startsWith('K2') || prefix.startsWith('K5') || prefix.startsWith('R1')) { // GI
      defaultRx.push({ code: '69400', description: 'Omeprazole 20mg (suggested)' });
    } else if (prefix.startsWith('E0') || prefix.startsWith('E2')) { // Endocrine
      defaultRx.push({ code: '69500', description: 'Levothyroxine 50mcg (suggested)' });
    } else if (prefix.startsWith('L')) { // Dermatologic
      defaultRx.push({ code: '69600', description: 'Hydrocortisone 1% cream (suggested)' });
    } else if (prefix.startsWith('A') || prefix.startsWith('B')) { // Infectious
      defaultRx.push({ code: '69250', description: 'Amoxicillin 500mg (suggested)' });
    } else if (prefix.startsWith('N3') || prefix.startsWith('N4') || prefix.startsWith('N5')) { // Genitourinary
      defaultRx.push({ code: '69704', description: 'Nitrofurantoin 100mg (suggested)' });
    } else {
      // Fallback based on category
      switch (category) {
        case 'E': // Endocrine
          defaultRx.push({ code: '68645', description: 'Metformin 500mg (suggested)' });
          break;
        case 'I': // Circulatory
          defaultRx.push({ code: '68720', description: 'Lisinopril 10mg (suggested)' });
          break;
        case 'J': // Respiratory
          defaultRx.push({ code: '69200', description: 'Albuterol inhaler (suggested)' });
          break;
        case 'F': // Mental Health
          defaultRx.push({ code: '69100', description: 'Sertraline 50mg (suggested)' });
          break;
        case 'M': // Musculoskeletal
          defaultRx.push({ code: '69300', description: 'Ibuprofen 600mg (suggested)' });
          break;
        case 'K': // Digestive
          defaultRx.push({ code: '69400', description: 'Omeprazole 20mg (suggested)' });
          break;
        case 'L': // Skin
          defaultRx.push({ code: '69600', description: 'Hydrocortisone 1% cream (suggested)' });
          break;
        case 'N': // Genitourinary
          defaultRx.push({ code: '69704', description: 'Nitrofurantoin 100mg (suggested)' });
          break;
        case 'G': // Nervous system
          defaultRx.push({ code: '69350', description: 'Sumatriptan 50mg (suggested)' });
          break;
        case 'H': // Eye/Ear
          defaultRx.push({ code: '70090', description: 'Timolol eye drops 0.5% (suggested)' });
          break;
        case 'R': // Symptoms
          defaultRx.push({ code: '69302', description: 'Acetaminophen 500mg (suggested)' });
          break;
        case 'Z': // Health status
          defaultRx.push({ code: '70006', description: 'Vitamin D 2000 IU (suggested)' });
          break;
        default:
          defaultRx.push({ code: '99999', description: 'Manual review required' });
      }
    }

    return defaultRx;
  };

  const filteredResults = useMemo(() => {
    if (!searchTerm) return results;
    return results.filter(result => 
      result.icdCode.includes(searchTerm.toUpperCase()) ||
      result.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.rxCodes.some(rx => 
        rx.code.includes(searchTerm) || 
        rx.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [results, searchTerm]);

  const exportResults = () => {
    const csvContent = [
      ['ICD-10 Code', 'Condition', 'RX Code', 'Medication Description', 'Status'],
      ...results.flatMap(result => 
        result.rxCodes.map(rx => [
          result.icdCode,
          result.condition,
          rx.code,
          rx.description,
          result.status
        ])
      )
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'icd10_to_rx_mappings.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ICD-10 to RX Code Generator</h1>
        <p className="text-gray-600">Generate matching prescription codes for ICD-10 diagnosis codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter ICD-10 Codes (one per line or comma-separated)
            </label>
            <textarea
              value={inputCodes}
              onChange={(e) => setInputCodes(e.target.value)}
              placeholder="E11.9&#10;I10&#10;F32.9&#10;J45.9"
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={6}
            />
          </div>
          
          <button
            onClick={processInputCodes}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Generate RX Codes
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Enter ICD-10 codes one per line or separated by commas</li>
            <li>• Common codes like E11.9 (diabetes), I10 (hypertension) are pre-mapped</li>
            <li>• Suggested codes are generated for unmapped ICD-10 codes</li>
            <li>• Review all suggestions with healthcare providers</li>
            <li>• Export results to CSV for further processing</li>
          </ul>
          
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Sample ICD-10 Codes:</strong><br/>
              E11.9 (Type 2 Diabetes), I10 (Hypertension)<br/>
              F32.9 (Depression), J45.9 (Asthma)<br/>
              K21.9 (GERD), M25.50 (Joint Pain)
            </p>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Generated Results ({results.length} ICD-10 codes processed)
            </h2>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={exportResults}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-lg font-semibold text-blue-600">
                        {result.icdCode}
                      </span>
                      {result.status === 'found' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <p className="text-gray-700 font-medium">{result.condition}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.status === 'found' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {result.status === 'found' ? 'Mapped' : 'Suggested'}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Matching RX Codes:</h4>
                  <div className="grid gap-2">
                    {result.rxCodes.map((rx, rxIndex) => (
                      <div key={rxIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-mono font-semibold text-purple-600 mr-3">
                            {rx.code}
                          </span>
                          <span className="text-gray-700">{rx.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Enter ICD-10 codes above to generate matching RX codes</p>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Clinical Use Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Primary Care:</h4>
            <ul className="space-y-1">
              <li>• Diabetes management protocols</li>
              <li>• Hypertension treatment guidelines</li>
              <li>• Depression screening follow-up</li>
              <li>• Preventive care prescribing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Specialized Care:</h4>
            <ul className="space-y-1">
              <li>• Pain management protocols</li>
              <li>• Cardiology medication selection</li>
              <li>• Respiratory therapy guidance</li>
              <li>• Endocrine disorder treatment</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-semibold text-amber-900 mb-2">Clinical Documentation Notes</h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Use this tool as a clinical decision support aid, not a replacement for clinical judgment</li>
          <li>• Consider patient-specific factors: allergies, contraindications, drug interactions</li>
          <li>• Verify dosing and administration routes for individual patients</li>
          <li>• Review current evidence-based guidelines for treatment protocols</li>
          <li>• Document rationale for medication selection in patient records</li>
        </ul>
      </div>
    </div>
  );
};

export default ICD10ToRXGenerator;