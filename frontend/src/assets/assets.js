import appointment_img from './appointment_img.png';
import header_img from './header_img.png';
import group_profiles from './group_profiles.png';
import profile_pic from './profile_pic.png';
import contact_image from './contact_image.png';
import about_image from './about_image.png';
import logo from './logo.svg';
import dropdown_icon from './dropdown_icon.svg';
import menu_icon from './menu_icon.svg';
import cross_icon from './cross_icon.png';
import chats_icon from './chats_icon.svg';
import verified_icon from './verified_icon.svg';
import arrow_icon from './arrow_icon.svg';
import info_icon from './info_icon.svg';
import upload_icon from './upload_icon.png';
import stripe_logo from './stripe_logo.png';
import razorpay_logo from './razorpay_logo.png';
import doc1 from './doc1.png';
import doc2 from './doc2.png';
import doc3 from './doc3.png';
import doc4 from './doc4.png';
import doc5 from './doc5.png';
import doc6 from './doc6.png';
import doc7 from './doc7.png';
import doc8 from './doc8.png';
import doc9 from './doc9.png';
import doc10 from './doc10.png';
import doc11 from './doc11.png';
import doc12 from './doc12.png';
import doc13 from './doc13.png';
import doc14 from './doc14.png';
import doc15 from './doc15.png';
import Dermatologist from './Dermatologist.svg';
import Gastroenterologist from './Gastroenterologist.svg';
import General_physician from './General_physician.svg';
import Gynecologist from './Gynecologist.svg';
import Neurologist from './Neurologist.svg';
import Pediatricians from './Pediatricians.svg';
import privacy_icon from './privacy_policy_image.jpg';
import diabetes from './diabetes.jpg';
import hypertension from './hypertension.jpg';
import hiv from './hiv.jpg';
import dengue from './dengue_fever.jpg';
import asthma from './asthma_illustration.jpg';
import tuberclosis from './tuberculosis.jpg';
import malaria from './malaria.jpg';
import cancer from './cancer.jpg';
import flu from './influenza_flu.jpg';
import virus_icon from './virus_icon_no_bg.jpg';
import green_location from './green-location.png';
import storeBanner1 from './storeBanner1.jpg';
import storeBanner2 from './storeBanner2.jpg';
import storeBanner3 from './storeBanner3.jpg';
import storeBanner4 from './storeBanner4.jpg';
import banner2 from './banner2.png';
import main_logo from './main_logo.png';
import background_video from './background_video.mp4';
import login_bg from './login_bg.jpg';
import storeVideo from './store.mp4';
import lab_image from './lab_image.jpg'
import video from './video.mp4'

export const assets = {
  background_video,
  lab_image,
  login_bg,
  main_logo,
  appointment_img,
  header_img,
  group_profiles,
  logo,
  chats_icon,
  verified_icon,
  info_icon,
  profile_pic,
  arrow_icon,
  contact_image,
  about_image,
  menu_icon,
  cross_icon,
  dropdown_icon,
  upload_icon,
  stripe_logo,
  razorpay_logo,
  privacy_icon,
  virus_icon,
  green_location,
  banner2,
  storeVideo,
  video,
  placeholder_image: '/images/placeholder.png', // Added as a fallback for missing images
};

export const storeBanner = [
  storeBanner1,
  storeBanner2,
  storeBanner3,
  storeBanner4,
];

export const specialityData = [
  {
    speciality: 'General physician',
    image: General_physician,
  },
  {
    speciality: 'Gynecologist',
    image: Gynecologist,
  },
  {
    speciality: 'Dermatologist',
    image: Dermatologist,
  },
  {
    speciality: 'Pediatricians',
    image: Pediatricians,
  },
  {
    speciality: 'Neurologist',
    image: Neurologist,
  },
  {
    speciality: 'Gastroenterologist',
    image: Gastroenterologist,
  },
];

export const doctors = [
  {
    _id: 'doc1',
    name: 'Dr. Richard James',
    image: doc1,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. James has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 50,
    address: {
      line1: '17th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc2',
    name: 'Dr. Emily Larson',
    image: doc2,
    speciality: 'Gynecologist',
    degree: 'MBBS',
    experience: '3 Years',
    about: 'Dr. Larson has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 60,
    address: {
      line1: '27th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc3',
    name: 'Dr. Sarah Patel',
    image: doc3,
    speciality: 'Dermatologist',
    degree: 'MBBS',
    experience: '1 Years',
    about: 'Dr. Patel has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 30,
    address: {
      line1: '37th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc4',
    name: 'Dr. Christopher Lee',
    image: doc4,
    speciality: 'Pediatricians',
    degree: 'MBBS',
    experience: '2 Years',
    about: 'Dr. Lee has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 40,
    address: {
      line1: '47th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc5',
    name: 'Dr. Jennifer Garcia',
    image: doc5,
    speciality: 'Neurologist',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. Garcia has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 50,
    address: {
      line1: '57th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc6',
    name: 'Dr. Andrew Williams',
    image: doc6,
    speciality: 'Neurologist',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. Williams has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 50,
    address: {
      line1: '57th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc7',
    name: 'Dr. Christopher Davis',
    image: doc7,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 50,
    address: {
      line1: '17th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc8',
    name: 'Dr. Timothy White',
    image: doc8,
    speciality: 'Gynecologist',
    degree: 'MBBS',
    experience: '3 Years',
    about: 'Dr. White has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 60,
    address: {
      line1: '27th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc9',
    name: 'Dr. Ava Mitchell',
    image: doc9,
    speciality: 'Dermatologist',
    degree: 'MBBS',
    experience: '1 Years',
    about: 'Dr. Mitchell has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 30,
    address: {
      line1: '37th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc10',
    name: 'Dr. Jeffrey King',
    image: doc10,
    speciality: 'Pediatricians',
    degree: 'MBBS',
    experience: '2 Years',
    about: 'Dr. King has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 40,
    address: {
      line1: '47th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc11',
    name: 'Dr. Zoe Kelly',
    image: doc11,
    speciality: 'Neurologist',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. Kelly has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 50,
    address: {
      line1: '57th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc12',
    name: 'Dr. Patrick Harris',
    image: doc12,
    speciality: 'Neurologist',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. Harris has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 50,
    address: {
      line1: '57th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc13',
    name: 'Dr. Chloe Evans',
    image: doc13,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. Evans has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 50,
    address: {
      line1: '17th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc14',
    name: 'Dr. Ryan Martinez',
    image: doc14,
    speciality: 'Gynecologist',
    degree: 'MBBS',
    experience: '3 Years',
    about: 'Dr. Martinez has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 60,
    address: {
      line1: '27th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
  {
    _id: 'doc15',
    name: 'Dr. Amelia Hill',
    image: doc15,
    speciality: 'Dermatologist',
    degree: 'MBBS',
    experience: '1 Years',
    about: 'Dr. Hill has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
    fees: 30,
    address: {
      line1: '37th Cross, Richmond',
      line2: 'Circle, Ring Road, London',
    },
  },
];

export const diseases = [
  {
    name: 'Diabetes',
    category: 'Chronic',
    image: diabetes,
    description: 'Diabetes is a chronic metabolic disorder characterized by elevated blood glucose levels due to the body\'s inability to produce or effectively use insulin. It affects how your body converts food into energy and can lead to serious health complications if not managed properly.',
    affectedPeople: '422 million worldwide',
    overview: 'Diabetes occurs when your pancreas doesn\'t produce enough insulin or when your body can\'t effectively use the insulin it produces. Insulin is a hormone that regulates blood sugar. There are three main types: Type 1 (autoimmune), Type 2 (lifestyle-related), and Gestational diabetes (during pregnancy).',
    symptoms: [
      'Increased thirst and dry mouth',
      'Frequent urination, especially at night',
      'Unexplained weight loss',
      'Fatigue and weakness',
      'Blurred vision',
      'Slow-healing cuts and wounds',
      'Tingling or numbness in hands or feet',
      'Frequent infections',
      'Darkened skin patches (acanthosis nigricans)',
      'Irritability and mood changes'
    ],
    causes: [
      'Type 1: Autoimmune destruction of insulin-producing cells',
      'Type 2: Insulin resistance due to obesity and sedentary lifestyle',
      'Genetic predisposition and family history',
      'Poor dietary habits (high sugar, processed foods)',
      'Physical inactivity',
      'Age (risk increases after 45)',
      'Polycystic ovary syndrome (PCOS)',
      'High blood pressure and abnormal cholesterol levels'
    ],
    riskFactors: [
      'Family history of diabetes',
      'Overweight or obesity (BMI > 25)',
      'Age 45 or older',
      'Physical inactivity',
      'History of gestational diabetes',
      'Prediabetes condition',
      'High blood pressure',
      'Ethnicity (higher risk in certain populations)'
    ],
    diagnosis: [
      'Fasting Blood Sugar Test (FBS)',
      'HbA1c (Glycated Hemoglobin) Test',
      'Oral Glucose Tolerance Test (OGTT)',
      'Random Blood Sugar Test',
      'C-Peptide Test',
      'Autoantibody Tests (for Type 1)'
    ],
    treatments: [
      'Insulin therapy (for Type 1 and advanced Type 2)',
      'Oral medications (Metformin, Sulfonylureas, DPP-4 inhibitors)',
      'GLP-1 receptor agonists',
      'SGLT2 inhibitors',
      'Blood sugar monitoring devices',
      'Continuous glucose monitoring (CGM)',
      'Insulin pumps',
      'Lifestyle modifications'
    ],
    prevention: [
      'Maintain a healthy weight through diet and exercise',
      'Eat a balanced diet rich in fiber, vegetables, and whole grains',
      'Exercise at least 150 minutes per week',
      'Limit sugar and processed food intake',
      'Get regular health screenings',
      'Manage stress effectively',
      'Quit smoking',
      'Limit alcohol consumption'
    ],
    whenToSeeDoctor: [
      'Excessive thirst or frequent urination',
      'Unexplained weight loss',
      'Blurred vision or vision changes',
      'Numbness in extremities',
      'Wounds that don\'t heal',
      'Frequent infections'
    ],
    faqs: [
      { q: 'Can diabetes be cured?', a: 'Type 2 diabetes can be managed and potentially reversed with lifestyle changes, but Type 1 requires lifelong insulin therapy.' },
      { q: 'What is a normal blood sugar level?', a: 'Normal fasting blood sugar is less than 100 mg/dL. Levels between 100-125 indicate prediabetes.' },
      { q: 'Can I eat fruits if I have diabetes?', a: 'Yes, but choose low-glycemic fruits like berries, apples, and pears in moderate portions.' }
    ]
  },
  {
    name: 'Hypertension',
    category: 'Chronic',
    image: hypertension,
    description: 'Hypertension, commonly known as high blood pressure, is a chronic condition where the force of blood against artery walls is consistently too high. Often called the "silent killer," it usually has no symptoms but significantly increases the risk of heart disease, stroke, and kidney problems.',
    affectedPeople: '1.28 billion adults worldwide',
    overview: 'Blood pressure is measured in millimeters of mercury (mmHg) and recorded as systolic (pressure when heart beats) over diastolic (pressure between beats). Normal is below 120/80 mmHg. Hypertension is diagnosed when readings consistently reach 130/80 mmHg or higher.',
    symptoms: [
      'Usually asymptomatic (silent condition)',
      'Severe headaches (in hypertensive crisis)',
      'Shortness of breath',
      'Nosebleeds',
      'Dizziness or lightheadedness',
      'Chest pain',
      'Visual changes',
      'Blood in urine',
      'Pounding in chest, neck, or ears',
      'Fatigue'
    ],
    causes: [
      'Primary (Essential): No identifiable cause, develops over years',
      'Secondary: Caused by underlying conditions',
      'Kidney disease',
      'Adrenal gland tumors',
      'Thyroid problems',
      'Certain medications (birth control, decongestants)',
      'Obstructive sleep apnea',
      'Congenital blood vessel defects'
    ],
    riskFactors: [
      'Age (risk increases with age)',
      'Family history of hypertension',
      'Obesity or overweight',
      'Sedentary lifestyle',
      'High sodium diet',
      'Low potassium intake',
      'Excessive alcohol consumption',
      'Smoking and tobacco use',
      'Chronic stress',
      'Chronic kidney disease'
    ],
    diagnosis: [
      'Blood Pressure Measurement (sphygmomanometer)',
      'Ambulatory Blood Pressure Monitoring (24-hour)',
      'Home Blood Pressure Monitoring',
      'Blood tests (kidney function, cholesterol)',
      'Urinalysis',
      'Electrocardiogram (ECG)',
      'Echocardiogram'
    ],
    treatments: [
      'ACE inhibitors (Lisinopril, Enalapril)',
      'ARBs (Losartan, Valsartan)',
      'Calcium channel blockers (Amlodipine)',
      'Diuretics (Hydrochlorothiazide)',
      'Beta-blockers (Metoprolol)',
      'Lifestyle modifications',
      'DASH diet implementation',
      'Regular monitoring'
    ],
    prevention: [
      'Reduce salt intake (less than 2,300mg/day)',
      'Follow the DASH diet',
      'Exercise regularly (30 minutes daily)',
      'Maintain healthy weight',
      'Limit alcohol consumption',
      'Quit smoking',
      'Manage stress through relaxation techniques',
      'Get adequate sleep (7-9 hours)',
      'Regular blood pressure monitoring'
    ],
    whenToSeeDoctor: [
      'Blood pressure readings above 180/120 mmHg',
      'Severe headaches with no known cause',
      'Difficulty breathing',
      'Chest pain or discomfort',
      'Vision problems',
      'Blood in urine'
    ],
    faqs: [
      { q: 'What is normal blood pressure?', a: 'Normal blood pressure is less than 120/80 mmHg. Elevated is 120-129/<80, and hypertension starts at 130/80 mmHg.' },
      { q: 'Can hypertension be cured?', a: 'While essential hypertension cannot be cured, it can be effectively managed with medication and lifestyle changes.' },
      { q: 'How often should I check my blood pressure?', a: 'Adults should check at least once every 2 years. Those with high BP should monitor more frequently as advised by their doctor.' }
    ]
  },
  {
    name: 'Dengue',
    category: 'Viral',
    image: dengue,
    description: 'Dengue fever is a mosquito-borne viral infection transmitted by Aedes mosquitoes, particularly Aedes aegypti. It causes severe flu-like symptoms and can develop into life-threatening dengue hemorrhagic fever or dengue shock syndrome in severe cases.',
    affectedPeople: '390 million infections per year',
    overview: 'Dengue is caused by four related viruses (DENV-1 to DENV-4). Infection with one provides lifelong immunity to that serotype but only temporary protection against others. Second infections with different serotypes increase the risk of severe dengue.',
    symptoms: [
      'High fever (104°F/40°C)',
      'Severe headache',
      'Pain behind the eyes (retro-orbital pain)',
      'Muscle and joint pains (breakbone fever)',
      'Nausea and vomiting',
      'Skin rash (appears 2-5 days after fever)',
      'Mild bleeding (nose, gums)',
      'Fatigue and weakness',
      'Swollen lymph nodes',
      'Loss of appetite'
    ],
    causes: [
      'Dengue virus (DENV-1, 2, 3, or 4)',
      'Transmitted by infected Aedes aegypti mosquitoes',
      'Also transmitted by Aedes albopictus',
      'Mosquitoes breed in stagnant water',
      'Peak transmission during monsoon season',
      'Urban areas with poor sanitation',
      'Travel to endemic regions'
    ],
    riskFactors: [
      'Living or traveling to tropical/subtropical regions',
      'Prior infection with a different dengue serotype',
      'Rainy season exposure',
      'Urban and semi-urban areas',
      'Poor mosquito control measures',
      'Lack of protective clothing',
      'Stagnant water sources nearby'
    ],
    diagnosis: [
      'NS1 Antigen Test (early detection)',
      'Dengue IgM and IgG Antibody Tests',
      'Complete Blood Count (CBC)',
      'Platelet count monitoring',
      'Liver function tests',
      'PCR test for viral RNA',
      'Hematocrit levels'
    ],
    treatments: [
      'No specific antiviral treatment available',
      'Supportive care and rest',
      'Oral or IV fluid replacement',
      'Acetaminophen for fever and pain',
      'Avoid aspirin and NSAIDs (bleeding risk)',
      'Blood transfusion if severe bleeding',
      'Platelet transfusion if count very low',
      'Hospitalization for severe cases'
    ],
    prevention: [
      'Use mosquito repellents containing DEET',
      'Wear long-sleeved shirts and pants',
      'Use mosquito nets while sleeping',
      'Install window and door screens',
      'Eliminate stagnant water sources',
      'Empty containers that collect water weekly',
      'Use air conditioning when possible',
      'Dengue vaccine (Dengvaxia) for endemic areas',
      'Community mosquito control programs'
    ],
    whenToSeeDoctor: [
      'High fever lasting more than 2 days',
      'Severe abdominal pain',
      'Persistent vomiting',
      'Bleeding from gums or nose',
      'Blood in stool or vomit',
      'Difficulty breathing',
      'Cold or clammy skin',
      'Extreme fatigue'
    ],
    faqs: [
      { q: 'Can dengue spread from person to person?', a: 'No, dengue cannot spread directly between people. It requires a mosquito vector for transmission.' },
      { q: 'How long does dengue fever last?', a: 'Most people recover within 2-7 days. The critical phase occurs around days 3-7 when platelet counts drop.' },
      { q: 'Can you get dengue more than once?', a: 'Yes, there are 4 dengue virus serotypes. Infection provides immunity to that type but not others.' }
    ]
  },
  {
    name: 'Asthma',
    category: 'Common',
    image: asthma,
    description: 'Asthma is a chronic respiratory condition characterized by inflammation and narrowing of the airways, leading to recurring episodes of wheezing, breathlessness, chest tightness, and coughing. It affects people of all ages and can range from mild to life-threatening.',
    affectedPeople: '262 million worldwide',
    overview: 'In asthma, the airways become swollen and produce extra mucus, making breathing difficult. Triggers can cause bronchospasm (sudden tightening of muscles around airways). While asthma cannot be cured, proper management allows most people to lead active lives.',
    symptoms: [
      'Wheezing (whistling sound when breathing)',
      'Shortness of breath',
      'Chest tightness or pain',
      'Persistent coughing, especially at night',
      'Trouble sleeping due to breathing issues',
      'Coughing or wheezing attacks worsened by respiratory infections',
      'Difficulty speaking during attacks',
      'Rapid breathing',
      'Anxiety or panic during severe attacks',
      'Blue lips or fingernails (severe cases)'
    ],
    causes: [
      'Genetic predisposition',
      'Allergies (dust mites, pollen, pet dander)',
      'Respiratory infections in childhood',
      'Environmental factors (pollution, smoke)',
      'Occupational exposures (chemicals, dust)',
      'Exercise (exercise-induced asthma)',
      'Cold air exposure',
      'Strong emotions and stress'
    ],
    riskFactors: [
      'Family history of asthma or allergies',
      'Personal history of allergies (allergic rhinitis, eczema)',
      'Childhood respiratory infections',
      'Exposure to secondhand smoke',
      'Obesity',
      'Living in urban areas with high pollution',
      'Occupational chemical exposure',
      'Premature birth or low birth weight'
    ],
    diagnosis: [
      'Spirometry (lung function test)',
      'Peak Flow Measurement',
      'Methacholine Challenge Test',
      'Exhaled Nitric Oxide Test',
      'Allergy Testing (skin prick or blood)',
      'Chest X-ray',
      'CT scan (to rule out other conditions)'
    ],
    treatments: [
      'Quick-relief inhalers (Salbutamol/Albuterol)',
      'Inhaled corticosteroids (Budesonide, Fluticasone)',
      'Long-acting beta agonists (Salmeterol)',
      'Combination inhalers',
      'Leukotriene modifiers (Montelukast)',
      'Biologic therapies for severe asthma',
      'Allergy immunotherapy',
      'Oral corticosteroids (for severe attacks)',
      'Nebulizer treatments'
    ],
    prevention: [
      'Identify and avoid personal triggers',
      'Take medications as prescribed',
      'Use air purifiers at home',
      'Keep home clean and dust-free',
      'Avoid outdoor activities when air quality is poor',
      'Get annual flu vaccination',
      'Create an asthma action plan with doctor',
      'Monitor symptoms and peak flow regularly',
      'Quit smoking and avoid secondhand smoke'
    ],
    whenToSeeDoctor: [
      'Symptoms worsen despite medication',
      'Quick-relief inhaler doesn\'t help',
      'Difficulty speaking or walking due to breathlessness',
      'Blue lips or fingernails',
      'Severe chest tightness',
      'Peak flow readings in the red zone'
    ],
    faqs: [
      { q: 'Can asthma be cured?', a: 'Asthma cannot be cured, but it can be effectively controlled with proper treatment and trigger avoidance.' },
      { q: 'Is asthma hereditary?', a: 'Yes, having a parent with asthma increases your risk. However, environmental factors also play a role.' },
      { q: 'Can adults develop asthma?', a: 'Yes, adult-onset asthma is common and can develop at any age, often triggered by allergies or respiratory infections.' }
    ]
  },
  {
    name: 'Tuberculosis',
    category: 'Common',
    image: tuberclosis,
    description: 'Tuberculosis (TB) is a potentially serious infectious disease caused by Mycobacterium tuberculosis bacteria. It primarily affects the lungs but can spread to other organs. TB spreads through the air when infected individuals cough, sneeze, or speak.',
    affectedPeople: '10.6 million cases per year',
    overview: 'TB exists in two forms: latent TB (bacteria present but dormant, not contagious) and active TB (causes symptoms and is contagious). About 5-10% of latent TB cases become active. TB is curable with proper treatment, but drug-resistant strains are a growing concern.',
    symptoms: [
      'Persistent cough lasting 3+ weeks',
      'Coughing up blood or sputum',
      'Chest pain while breathing or coughing',
      'Unexplained weight loss',
      'Fatigue and weakness',
      'Fever and chills',
      'Night sweats',
      'Loss of appetite',
      'Swollen lymph nodes',
      'Shortness of breath'
    ],
    causes: [
      'Mycobacterium tuberculosis bacteria',
      'Spread through airborne droplets',
      'Close contact with infected individuals',
      'Poorly ventilated spaces',
      'Crowded living conditions',
      'Healthcare settings without proper precautions',
      'Weakened immune system increases risk of progression'
    ],
    riskFactors: [
      'HIV/AIDS (highest risk factor)',
      'Weakened immune system',
      'Close contact with TB patients',
      'Living in or traveling to high-prevalence areas',
      'Healthcare workers',
      'Living in crowded conditions',
      'Substance abuse',
      'Malnutrition',
      'Diabetes',
      'Certain medications (immunosuppressants)'
    ],
    diagnosis: [
      'Tuberculin Skin Test (Mantoux test)',
      'Interferon-Gamma Release Assays (IGRAs)',
      'Chest X-ray',
      'Sputum Microscopy',
      'Sputum Culture',
      'GeneXpert MTB/RIF test',
      'Drug sensitivity testing',
      'CT scan for extrapulmonary TB'
    ],
    treatments: [
      'First-line drugs: Isoniazid, Rifampicin, Pyrazinamide, Ethambutol',
      'Standard treatment: 6-9 months regimen',
      'DOTS (Directly Observed Treatment, Short-course)',
      'Second-line drugs for drug-resistant TB',
      'Bedaquiline for multidrug-resistant TB',
      'Nutritional support',
      'Isolation during infectious period',
      'Treatment completion is essential to prevent resistance'
    ],
    prevention: [
      'BCG vaccination (especially for children)',
      'Early detection and treatment of cases',
      'Proper ventilation in living spaces',
      'Use of N95 masks in high-risk settings',
      'Contact tracing and testing',
      'Isoniazid preventive therapy for latent TB',
      'Cough etiquette and hygiene',
      'Avoiding close contact with known TB cases',
      'Regular health screenings for high-risk groups'
    ],
    whenToSeeDoctor: [
      'Persistent cough lasting more than 3 weeks',
      'Unexplained weight loss',
      'Night sweats',
      'Coughing up blood',
      'Prolonged fever',
      'Known exposure to TB patient'
    ],
    faqs: [
      { q: 'Is TB contagious?', a: 'Active pulmonary TB is contagious and spreads through air. Latent TB is not contagious.' },
      { q: 'How long is TB treatment?', a: 'Standard TB treatment lasts 6-9 months. Drug-resistant TB may require 18-24 months of treatment.' },
      { q: 'Can TB be completely cured?', a: 'Yes, TB is curable with proper treatment. However, completing the full course is essential to prevent relapse and resistance.' }
    ]
  },
  {
    name: 'Malaria',
    category: 'Viral',
    image: malaria,
    description: 'Malaria is a life-threatening parasitic disease transmitted through the bites of infected female Anopheles mosquitoes. It causes high fever, chills, and flu-like illness. Without prompt treatment, it can lead to severe complications and death.',
    affectedPeople: '247 million cases in 2021',
    overview: 'Malaria is caused by Plasmodium parasites, with P. falciparum being the most deadly. The parasites multiply in the liver before entering red blood cells. Symptoms typically appear 10-15 days after infection. Malaria is preventable and curable.',
    symptoms: [
      'High fever with chills and rigors',
      'Profuse sweating',
      'Severe headache',
      'Muscle and joint pain',
      'Fatigue and weakness',
      'Nausea and vomiting',
      'Abdominal pain',
      'Diarrhea',
      'Anemia',
      'Jaundice (yellowing of skin and eyes)'
    ],
    causes: [
      'Plasmodium parasites (P. falciparum, P. vivax, P. ovale, P. malariae)',
      'Transmitted by infected Anopheles mosquitoes',
      'Mosquitoes bite between dusk and dawn',
      'Blood transfusion (rare)',
      'Shared needles',
      'Mother to child during pregnancy',
      'Organ transplantation (rare)'
    ],
    riskFactors: [
      'Living in or traveling to endemic regions (Africa, South Asia)',
      'Lack of immunity (travelers from non-endemic areas)',
      'Young children and infants',
      'Pregnant women',
      'People with HIV/AIDS',
      'Splenectomy patients',
      'Outdoor activities during peak mosquito hours',
      'Poor access to healthcare'
    ],
    diagnosis: [
      'Malaria Rapid Diagnostic Test (RDT)',
      'Thick and thin blood smear microscopy',
      'Polymerase Chain Reaction (PCR)',
      'Complete Blood Count',
      'Liver and kidney function tests',
      'Blood glucose levels',
      'Parasite density count'
    ],
    treatments: [
      'Artemisinin-based Combination Therapy (ACT)',
      'Chloroquine (for sensitive strains)',
      'Primaquine (to prevent relapse in P. vivax)',
      'Quinine (for severe malaria)',
      'Artesunate (IV for severe cases)',
      'Supportive care (fluids, fever management)',
      'Blood transfusion if severe anemia',
      'Exchange transfusion (extreme cases)'
    ],
    prevention: [
      'Use insecticide-treated bed nets (ITNs)',
      'Apply mosquito repellent containing DEET',
      'Wear long-sleeved clothing after dusk',
      'Use indoor residual spraying',
      'Take antimalarial prophylaxis when traveling',
      'Eliminate mosquito breeding sites',
      'Install window and door screens',
      'Stay in air-conditioned rooms',
      'RTS,S malaria vaccine for children'
    ],
    whenToSeeDoctor: [
      'High fever after visiting endemic area',
      'Shaking chills and sweating',
      'Severe headache',
      'Confusion or altered consciousness',
      'Difficulty breathing',
      'Severe vomiting',
      'Signs of anemia'
    ],
    faqs: [
      { q: 'Can malaria be transmitted person to person?', a: 'Not directly. It requires a mosquito vector, though it can spread through blood transfusion or shared needles.' },
      { q: 'How long after a bite do symptoms appear?', a: 'Symptoms typically appear 10-15 days after an infected mosquito bite, but can take months with certain parasites.' },
      { q: 'Is there a malaria vaccine?', a: 'Yes, the RTS,S vaccine is available for children in endemic regions and provides partial protection.' }
    ]
  },
  {
    name: 'Cancer',
    category: 'Chronic',
    image: cancer,
    description: 'Cancer is a group of diseases characterized by uncontrolled growth and spread of abnormal cells. If not controlled, it can result in death. Cancer can develop in almost any organ or tissue and has many types, each requiring specific treatment approaches.',
    affectedPeople: 'Over 19.3 million cases per year',
    overview: 'Cancer develops when the body\'s normal control mechanisms stop working. Old cells do not die and instead grow out of control, forming abnormal cells and often tumors. There are over 100 types of cancer, classified by the cell type or organ of origin.',
    symptoms: [
      'Unexplained weight loss',
      'Persistent fatigue',
      'Lumps or thickening in any body part',
      'Skin changes (darkening, yellowing, redness)',
      'Changes in bowel or bladder habits',
      'Persistent cough or trouble breathing',
      'Difficulty swallowing',
      'Hoarseness of voice',
      'Unexplained bleeding or bruising',
      'Persistent indigestion or discomfort after eating',
      'Persistent, unexplained muscle or joint pain',
      'Unexplained fevers or night sweats'
    ],
    causes: [
      'Genetic mutations (inherited or acquired)',
      'Tobacco use (leading cause of preventable cancer)',
      'Unhealthy diet and obesity',
      'Physical inactivity',
      'Excessive alcohol consumption',
      'Certain infections (HPV, Hepatitis B/C, H. pylori)',
      'UV radiation and sun exposure',
      'Environmental pollutants and carcinogens',
      'Radiation exposure',
      'Hormonal factors'
    ],
    riskFactors: [
      'Age (most cancers occur after 65)',
      'Family history of cancer',
      'Tobacco and alcohol use',
      'Obesity and poor diet',
      'Chronic inflammation',
      'Immunosuppression',
      'Occupational hazards (asbestos, chemicals)',
      'Certain chronic infections',
      'Hormone replacement therapy'
    ],
    diagnosis: [
      'Physical examination',
      'Blood tests (tumor markers like PSA, CA-125)',
      'Imaging tests (X-ray, CT, MRI, PET scan)',
      'Biopsy (tissue examination)',
      'Endoscopy',
      'Genetic testing',
      'Bone marrow aspiration',
      'Staging procedures'
    ],
    treatments: [
      'Surgery (tumor removal)',
      'Chemotherapy',
      'Radiation therapy',
      'Immunotherapy',
      'Targeted therapy',
      'Hormone therapy',
      'Stem cell transplant',
      'Precision medicine',
      'Palliative care',
      'Clinical trials for new treatments'
    ],
    prevention: [
      'Quit smoking and avoid tobacco',
      'Limit alcohol consumption',
      'Maintain healthy weight',
      'Eat a balanced diet with fruits and vegetables',
      'Exercise regularly',
      'Protect skin from sun exposure',
      'Get vaccinated (HPV, Hepatitis B)',
      'Practice safe sex',
      'Regular health screenings',
      'Avoid known carcinogens',
      'Breastfeed if possible'
    ],
    whenToSeeDoctor: [
      'Unexplained weight loss of 10+ pounds',
      'Persistent fatigue',
      'New lumps or growths',
      'Unusual bleeding',
      'Changes in skin moles',
      'Persistent pain without cause',
      'Difficulty swallowing'
    ],
    faqs: [
      { q: 'Is cancer hereditary?', a: 'About 5-10% of cancers are hereditary. Most result from genetic changes during lifetime due to environmental factors.' },
      { q: 'Can cancer be prevented?', a: 'Many cancers are preventable through lifestyle changes. About 30-50% of cancers could be prevented by avoiding risk factors.' },
      { q: 'What is the difference between benign and malignant tumors?', a: 'Benign tumors are not cancer and don\'t spread. Malignant tumors are cancerous and can invade nearby tissues and spread.' }
    ]
  },
  {
    name: 'Influenza (Flu)',
    category: 'Common',
    image: flu,
    description: 'Influenza, commonly known as the flu, is a contagious respiratory illness caused by influenza viruses that infect the nose, throat, and sometimes the lungs. It can cause mild to severe illness and can lead to hospitalization and death.',
    affectedPeople: '1 billion cases per year',
    overview: 'Flu viruses spread mainly by droplets when infected people cough, sneeze, or talk. It differs from the common cold and typically comes on suddenly. Most people recover in less than two weeks, but complications can occur in high-risk groups.',
    symptoms: [
      'Sudden onset of fever (100°F or higher)',
      'Chills and body aches',
      'Headache',
      'Fatigue and weakness',
      'Dry, persistent cough',
      'Sore throat',
      'Runny or stuffy nose',
      'Muscle or body aches',
      'Vomiting and diarrhea (more common in children)',
      'Loss of appetite'
    ],
    causes: [
      'Influenza A viruses (can cause pandemics)',
      'Influenza B viruses (cause seasonal epidemics)',
      'Influenza C viruses (cause mild illness)',
      'Spread through respiratory droplets',
      'Contact with contaminated surfaces',
      'Close contact with infected individuals',
      'Seasonal patterns (winter months in temperate climates)'
    ],
    riskFactors: [
      'Age (under 5, especially under 2; over 65)',
      'Pregnancy',
      'Chronic medical conditions',
      'Weakened immune system',
      'Obesity (BMI 40 or higher)',
      'Living in nursing homes',
      'Healthcare workers',
      'Unvaccinated individuals'
    ],
    diagnosis: [
      'Clinical symptoms evaluation',
      'Rapid influenza diagnostic tests (RIDTs)',
      'Rapid molecular assays',
      'RT-PCR for influenza',
      'Viral culture',
      'Immunofluorescence assays'
    ],
    treatments: [
      'Antiviral medications (Oseltamivir/Tamiflu, Zanamivir)',
      'Baloxavir marboxil (Xofluza)',
      'Rest and sleep',
      'Plenty of fluids',
      'Over-the-counter pain relievers',
      'Cough suppressants',
      'Hospitalization for severe cases',
      'Oxygen therapy if needed'
    ],
    prevention: [
      'Annual flu vaccination',
      'Wash hands frequently with soap',
      'Avoid touching face',
      'Cover coughs and sneezes',
      'Stay home when sick',
      'Clean frequently touched surfaces',
      'Avoid close contact with sick people',
      'Maintain a healthy lifestyle',
      'Wear masks in crowded areas during outbreaks'
    ],
    whenToSeeDoctor: [
      'Difficulty breathing or shortness of breath',
      'Persistent chest pain or pressure',
      'Confusion or altered mental status',
      'Severe or persistent vomiting',
      'Flu symptoms that improve then return with fever and worse cough',
      'High-risk individuals with any flu symptoms'
    ],
    faqs: [
      { q: 'How long is the flu contagious?', a: 'Most people are contagious from 1 day before symptoms to 5-7 days after becoming sick.' },
      { q: 'Can you get flu from the flu vaccine?', a: 'No, flu vaccines cannot cause flu. Injectable vaccines contain inactivated virus.' },
      { q: 'How is flu different from COVID-19?', a: 'Both are respiratory illnesses but caused by different viruses. COVID-19 tends to have longer incubation and can cause more severe illness.' }
    ]
  },
  {
    name: 'HIV/AIDS',
    category: 'Chronic',
    image: hiv,
    description: 'HIV (Human Immunodeficiency Virus) attacks the immune system, specifically CD4 cells (T cells). Untreated, HIV reduces CD4 cells, making the person vulnerable to infections and cancers. AIDS is the most advanced stage of HIV infection.',
    affectedPeople: '39 million people living with HIV',
    overview: 'HIV is a lifelong condition but with proper medical care, it can be controlled. Antiretroviral therapy (ART) can reduce viral load to undetectable levels (U=U: Undetectable = Untransmittable). Early diagnosis and treatment are crucial for long-term health.',
    symptoms: [
      'Acute HIV: Flu-like symptoms 2-4 weeks after infection',
      'Fever and chills',
      'Rash',
      'Swollen lymph nodes',
      'Sore throat',
      'Muscle aches',
      'Night sweats',
      'Mouth ulcers',
      'Fatigue',
      'Later stages: Weight loss, recurrent infections, opportunistic diseases'
    ],
    causes: [
      'HIV virus (HIV-1 and HIV-2)',
      'Sexual contact (vaginal, anal, or oral)',
      'Sharing needles or syringes',
      'Mother-to-child transmission (pregnancy, birth, breastfeeding)',
      'Blood transfusion with infected blood (rare in screened supplies)',
      'Occupational exposure (needle stick injuries)',
      'NOT spread by casual contact, air, water, or insects'
    ],
    riskFactors: [
      'Unprotected sexual intercourse',
      'Multiple sexual partners',
      'Having other STIs',
      'Sharing injection drug equipment',
      'Receiving unscreened blood products',
      'Mother with untreated HIV',
      'Healthcare workers (occupational risk)',
      'Men who have sex with men (MSM)'
    ],
    diagnosis: [
      'HIV antibody tests',
      'HIV antigen/antibody combination tests',
      'Nucleic Acid Tests (NAT)',
      'Rapid HIV tests',
      'Home testing kits',
      'CD4 count monitoring',
      'Viral load testing'
    ],
    treatments: [
      'Antiretroviral Therapy (ART) - lifelong',
      'NRTIs (Nucleoside reverse transcriptase inhibitors)',
      'NNRTIs (Non-nucleoside reverse transcriptase inhibitors)',
      'Protease inhibitors',
      'Integrase inhibitors',
      'Single-tablet regimens',
      'Regular monitoring of CD4 and viral load',
      'Treatment of opportunistic infections',
      'Preventive medications for related infections'
    ],
    prevention: [
      'Consistent and correct condom use',
      'PrEP (Pre-Exposure Prophylaxis) for high-risk individuals',
      'PEP (Post-Exposure Prophylaxis) after possible exposure',
      'Never share needles',
      'Regular HIV testing',
      'Treatment as Prevention (TasP)',
      'Voluntary medical male circumcision',
      'Prevention of mother-to-child transmission',
      'Safe blood transfusion practices'
    ],
    whenToSeeDoctor: [
      'Possible exposure to HIV',
      'Symptoms of acute HIV infection',
      'Regular testing if at high risk',
      'If diagnosed, immediate initiation of treatment',
      'Any symptoms of opportunistic infections',
      'Changes in health status while on treatment'
    ],
    faqs: [
      { q: 'Can HIV be cured?', a: 'There is currently no cure, but ART can control the virus effectively, allowing people to live long, healthy lives.' },
      { q: 'What does undetectable mean?', a: 'Undetectable means the viral load is so low that standard tests cannot detect it. People with undetectable viral loads cannot transmit HIV sexually (U=U).' },
      { q: 'How soon can HIV be detected after exposure?', a: 'Most tests can detect HIV 23-90 days after exposure. NAT can detect earlier (10-33 days).' }
    ]
  }
];
