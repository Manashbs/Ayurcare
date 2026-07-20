export interface Herb {
  name: string;
  hindiName: string;
  scientificName: string;
  sanskritName: string;
  desc: string;
  rasa: string;
  virya: string;
  vipaka: string;
  balances: ('Vata' | 'Pitta' | 'Kapha')[];
  benefits: string[];
  diseases: string[];
  consumption: string;
  precautions: string;
  color: string;
  category: 'Adaptogen' | 'Digestive' | 'Brain & Nerve' | 'Respiratory' | 'Skin & Blood' | 'Immunity' | 'Women\'s Health' | 'Men\'s Health' | 'Heart & Circulation' | 'Bone & Joint' | 'Liver & Detox' | 'Anti-Inflammatory';
  formulations: string[];
}

export const HERBS: Herb[] = [
  // ──────────────────────────────────
  // 1. Ashwagandha
  // ──────────────────────────────────
  {
    name: 'Ashwagandha',
    hindiName: 'अश्वगंधा (Asgandh)',
    scientificName: 'Withania somnifera',
    sanskritName: 'अश्वगंधा (Strength of a Horse)',
    desc: 'One of the most vital adaptogenic herbs in Ayurveda. Known as "Indian Ginseng," it combats chronic stress, builds physical endurance, supports thyroid function, and promotes restful sleep. Classified as a Rasayana (rejuvenator).',
    rasa: 'Bitter, Sweet, Pungent',
    virya: 'Heating (Ushna)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Kapha'],
    benefits: [
      'Reduces stress and cortisol levels significantly',
      'Enhances muscle strength and post-exercise recovery',
      'Supports cognitive focus, memory, and mental clarity',
      'Improves sleep quality and promotes deep REM sleep',
      'Boosts testosterone and male reproductive health',
      'Supports thyroid function (especially hypothyroidism)',
    ],
    diseases: ['Insomnia', 'Chronic Stress', 'Anxiety', 'Fatigue', 'General Debility', 'Hypothyroidism', 'Low Libido', 'Muscle Weakness'],
    consumption: 'Take 1/2 teaspoon (3g) of Ashwagandha Churna with warm milk and honey before bed. Capsule form: 500mg twice daily.',
    precautions: 'Avoid during active congestion or high toxic accumulation (Ama). Not recommended during pregnancy. May interact with thyroid and sedative medications.',
    color: 'from-amber-600 to-amber-700',
    category: 'Adaptogen',
    formulations: ['Ashwagandha Churna', 'Ashwagandharishta', 'Ashwagandha Ghrita', 'Ashwagandha Capsules'],
  },

  // ──────────────────────────────────
  // 2. Tulsi (Holy Basil)
  // ──────────────────────────────────
  {
    name: 'Tulsi (Holy Basil)',
    hindiName: 'तुलसी (Tulsi)',
    scientificName: 'Ocimum tenuiflorum (syn. Ocimum sanctum)',
    sanskritName: 'तुलसी (The Incomparable One)',
    desc: 'Considered the most sacred plant in Hindu tradition and an "Elixir of Life" in Ayurveda. Tulsi is a powerful adaptogen that clears respiratory pathways, purifies the blood, and elevates emotional well-being.',
    rasa: 'Pungent, Bitter',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Kapha', 'Vata'],
    benefits: [
      'Relieves cough, cold, and respiratory congestion',
      'Acts as a powerful antioxidant and antimicrobial agent',
      'Reduces physical and psychological stress (cortisol)',
      'Promotes healthy heart function and blood pressure',
      'Enhances immunity and fights seasonal infections',
      'Supports healthy blood sugar levels',
    ],
    diseases: ['Asthma', 'Bronchitis', 'Fever', 'Sore Throat', 'Mild Indigestion', 'Common Cold', 'Influenza', 'Sinusitis'],
    consumption: 'Boil 5-10 fresh leaves or 1/2 tsp dried Tulsi in water with ginger to make herbal Kadha. Drink 2-3 times daily.',
    precautions: 'Use with caution if suffering from high Pitta (acidity, burning sensations). Can thin blood; avoid before surgery.',
    color: 'from-emerald-600 to-emerald-750',
    category: 'Respiratory',
    formulations: ['Tulsi Ark', 'Tulsi Kadha', 'Tulsi Capsules', 'Tulsi-Ginger Tea'],
  },

  // ──────────────────────────────────
  // 3. Turmeric (Haridra)
  // ──────────────────────────────────
  {
    name: 'Turmeric (Haridra)',
    hindiName: 'हल्दी (Haldi)',
    scientificName: 'Curcuma longa',
    sanskritName: 'हरिद्रा (The Golden Goddess)',
    desc: 'The golden spice of wellness and India\'s most celebrated healing agent. Contains the bioactive compound Curcumin, famous for anti-inflammatory, blood-purifying, and skin-brightening properties.',
    rasa: 'Bitter, Pungent',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Kapha', 'Vata', 'Pitta'],
    benefits: [
      'Relieves joint pain and systemic inflammation',
      'Supports healthy liver and metabolic function',
      'Promotes glowing skin and accelerates wound healing',
      'Purifies blood and strengthens lymphatic system',
      'Boosts natural immunity and fights infections',
      'Supports brain health and may reduce Alzheimer risk',
    ],
    diseases: ['Arthritis', 'Skin Allergies', 'Indigestion', 'Sore Throat', 'Liver Congestion', 'Diabetes', 'Wounds', 'Eczema'],
    consumption: 'Stir 1/2 tsp Haldi powder in warm milk with a pinch of black pepper and ghee (Golden Milk). Take at bedtime.',
    precautions: 'Avoid in extremely high doses if suffering from gallstones or active bile duct obstructions. May interact with blood thinners.',
    color: 'from-yellow-500 to-yellow-600',
    category: 'Anti-Inflammatory',
    formulations: ['Haridra Khand', 'Haldi Doodh (Golden Milk)', 'Kanchnar Guggulu (with Haridra)', 'Turmeric Capsules'],
  },

  // ──────────────────────────────────
  // 4. Triphala
  // ──────────────────────────────────
  {
    name: 'Triphala',
    hindiName: 'त्रिफला (Triphala)',
    scientificName: 'Emblica officinalis + Terminalia bellirica + Terminalia chebula',
    sanskritName: 'त्रिफला (Three Fruits)',
    desc: 'Ayurveda\'s ultimate digestive cleanser and Tri-Dosha balancer. A compound formulation of three fruits — Amalaki, Bibhitaki, and Haritaki — that gently purifies the GI tract and rejuvenates all body tissues.',
    rasa: 'Sweet, Sour, Pungent, Bitter, Astringent (all 5 tastes)',
    virya: 'Neutral (Sama)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Pitta', 'Kapha'],
    benefits: [
      'Regulates bowel movements and cures constipation',
      'Detoxifies the entire gastrointestinal tract',
      'Supports ocular health and strengthens eyes',
      'Acts as a powerful internal antioxidant rejuvenator',
      'Supports healthy weight management',
      'Strengthens hair roots and improves skin texture',
    ],
    diseases: ['Constipation', 'Bloating', 'Indigestion', 'Slow Metabolism', 'Low Immunity', 'Eye Weakness', 'Obesity', 'Hemorrhoids'],
    consumption: 'Mix 1/2 to 1 tsp in warm water. Let sit for 5 minutes and drink on an empty stomach at bedtime.',
    precautions: 'Do not use if suffering from severe diarrhea, acute dysentery, or dehydration. Avoid during pregnancy.',
    color: 'from-amber-700 to-stone-700',
    category: 'Digestive',
    formulations: ['Triphala Churna', 'Triphala Guggulu', 'Triphala Ghrita', 'Triphala Tablets'],
  },

  // ──────────────────────────────────
  // 5. Shatavari
  // ──────────────────────────────────
  {
    name: 'Shatavari',
    hindiName: 'शतावरी (Shatavar / Satmuli)',
    scientificName: 'Asparagus racemosus',
    sanskritName: 'शतावरी (She Who Possesses 100 Husbands)',
    desc: 'The queen of herbs and the ultimate female tonic. A powerful hormonal rejuvenator and galactagogue known for cooling energy, deep nutritive properties, and building long-term stamina and ojas.',
    rasa: 'Sweet, Bitter',
    virya: 'Cooling (Shita)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Pitta', 'Vata'],
    benefits: [
      'Balances female reproductive hormones across all ages',
      'Soothes hyperacidity and heals stomach lining',
      'Increases vitality, stamina, and energy (Ojas)',
      'Supports lactation in nursing mothers',
      'Nourishes the reproductive system in both sexes',
      'Moisturizes dry membranes (lungs, stomach, reproductive)',
    ],
    diseases: ['Acidity', 'Stomach Ulcers', 'Hormonal Imbalance', 'PMS', 'General Weakness', 'Menopausal Symptoms', 'Infertility', 'Low Breast Milk'],
    consumption: 'Take 1/2 tsp Shatavari Churna with warm milk, ghee, or honey twice daily after meals.',
    precautions: 'Use with caution if suffering from high Kapha fluid retention or heavy chest congestion. Avoid if you have estrogen-sensitive conditions.',
    color: 'from-rose-500 to-rose-600',
    category: 'Women\'s Health',
    formulations: ['Shatavari Churna', 'Shatavari Kalpa', 'Shatavari Ghrita', 'Shatavari Tablets'],
  },

  // ──────────────────────────────────
  // 6. Neem
  // ──────────────────────────────────
  {
    name: 'Neem',
    hindiName: 'नीम (Neem)',
    scientificName: 'Azadirachta indica',
    sanskritName: 'निम्ब (Nimba – The Cure-All)',
    desc: 'One of the most potent detoxifiers and cooling agents in Ayurveda. Called "Sarva Roga Nivarini" (Healer of All Ailments), Neem is renowned for clarifying skin, purifying blood, and fighting infections.',
    rasa: 'Bitter, Astringent',
    virya: 'Cooling (Shita)',
    vipaka: 'Pungent (Katu)',
    balances: ['Pitta', 'Kapha'],
    benefits: [
      'Clears skin infections, acne, and fungal issues',
      'Purifies toxic blood and resolves liver stagnation',
      'Promotes excellent dental and gum health',
      'Regulates blood glucose levels naturally',
      'Acts as a natural pesticide and anthelmintic',
      'Supports wound healing and prevents scarring',
    ],
    diseases: ['Acne', 'Eczema', 'Psoriasis', 'Liver Congestion', 'Gum Bleeding', 'Malaria', 'Intestinal Worms', 'Fungal Infections'],
    consumption: 'Take 1/4 to 1/2 tsp Neem leaf powder with warm water once daily. Apply Neem paste topically for skin issues.',
    precautions: 'Highly cooling and drying — can aggravate Vata in excess. Limit continuous intake to 4-6 weeks. Not for pregnant women.',
    color: 'from-teal-600 to-teal-700',
    category: 'Skin & Blood',
    formulations: ['Neem Churna', 'Nimbadi Churna', 'Neem Oil', 'Neem Capsules', 'Neem Ark'],
  },

  // ──────────────────────────────────
  // 7. Brahmi
  // ──────────────────────────────────
  {
    name: 'Brahmi',
    hindiName: 'ब्राह्मी (Brahmi)',
    scientificName: 'Bacopa monnieri',
    sanskritName: 'ब्राह्मी (Gateway to Cosmic Consciousness)',
    desc: 'The premier brain tonic and Medhya Rasayana (intellect rejuvenator) of Ayurveda. Renowned for enhancing memory, focus, learning capacity, and inducing deep meditative calmness.',
    rasa: 'Bitter, Astringent',
    virya: 'Cooling (Shita)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Pitta', 'Kapha'],
    benefits: [
      'Improves memory recall, retention, and processing speed',
      'Reduces anxiety and calms the central nervous system',
      'Promotes deep sleep and mental clarity',
      'Helps alleviate chronic stress and mental fatigue',
      'Enhances concentration and learning ability in students',
      'Supports nerve regeneration and neuroprotection',
    ],
    diseases: ['Mental Fatigue', 'Memory Weakness', 'ADHD', 'Anxiety', 'Insomnia', 'Epilepsy', 'Speech Disorders', 'Alzheimer\'s (early)'],
    consumption: 'Mix 1/2 tsp Brahmi Churna in warm milk or water in the morning. Can also be taken as Brahmi Ghrita (medicated ghee).',
    precautions: 'May slow heart rate slightly in high doses. Consult physician if taking thyroid or sedative medications.',
    color: 'from-blue-600 to-blue-700',
    category: 'Brain & Nerve',
    formulations: ['Brahmi Churna', 'Brahmi Ghrita', 'Brahmi Vati', 'Saraswatarishta', 'Brahmi Oil'],
  },

  // ──────────────────────────────────
  // 8. Amla (Indian Gooseberry)
  // ──────────────────────────────────
  {
    name: 'Amla (Indian Gooseberry)',
    hindiName: 'आंवला (Amla / Aonla)',
    scientificName: 'Phyllanthus emblica (syn. Emblica officinalis)',
    sanskritName: 'आमलकी (Amalaki – The Sustainer)',
    desc: 'Called "Dhatri" (Mother) in Ayurveda for its nurturing properties. Amla is the single richest natural source of Vitamin C and one of the most powerful Rasayanas. It rejuvenates all tissues and slows aging.',
    rasa: 'Sour, Sweet, Pungent, Bitter, Astringent (5 of 6 tastes)',
    virya: 'Cooling (Shita)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Pitta', 'Kapha'],
    benefits: [
      'Richest natural source of Vitamin C (20x more than oranges)',
      'Strengthens immunity and builds natural disease resistance',
      'Promotes thick, lustrous hair and prevents premature greying',
      'Supports eye health and improves visual acuity',
      'Enhances iron absorption and prevents anemia',
      'Anti-aging Rasayana — rejuvenates all seven body tissues (Dhatus)',
    ],
    diseases: ['Anemia', 'Hair Loss', 'Premature Greying', 'Weak Immunity', 'Scurvy', 'Liver Disease', 'Diabetes', 'Eye Disorders'],
    consumption: 'Eat 1-2 fresh Amla fruits daily, or take 1/2 tsp Amla Churna with honey on empty stomach. Amla juice (20ml) also effective.',
    precautions: 'Can increase acidity if consumed in excess on an empty stomach. Avoid Amla in severe cold and cough (increases mucus in some).',
    color: 'from-lime-600 to-lime-700',
    category: 'Immunity',
    formulations: ['Chyawanprash', 'Amalaki Rasayana', 'Amla Churna', 'Dhatri Loha', 'Amla Juice'],
  },

  // ──────────────────────────────────
  // 9. Giloy (Guduchi)
  // ──────────────────────────────────
  {
    name: 'Giloy (Guduchi)',
    hindiName: 'गिलोय (Giloy / Guruch)',
    scientificName: 'Tinospora cordifolia',
    sanskritName: 'गुडूची (Guduchi – Protector of the Body)',
    desc: 'Known as "Amrita" (the root of immortality) in Ayurveda. Giloy is the supreme immunomodulatory herb that removes toxins, fights fever, and strengthens natural defense mechanisms against infections.',
    rasa: 'Bitter, Astringent',
    virya: 'Heating (Ushna)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Pitta', 'Kapha'],
    benefits: [
      'Boosts immunity and fights chronic and recurring fevers',
      'Detoxifies liver and purifies blood from deep toxins',
      'Controls blood sugar levels in Type 2 diabetes',
      'Reduces inflammation in arthritis and gout',
      'Treats chronic digestive issues and improves appetite',
      'Supports recovery post-dengue, chikungunya, and viral fevers',
    ],
    diseases: ['Dengue Fever', 'Chronic Fever', 'Diabetes', 'Gout', 'Arthritis', 'Liver Disorders', 'Low Platelet Count', 'Jaundice'],
    consumption: 'Boil 1 inch of fresh Giloy stem in water for 10 min to make Kadha. Or take Giloy Sattva (extract) 500mg with honey.',
    precautions: 'May lower blood sugar excessively in diabetic patients on medication. Avoid during autoimmune diseases without guidance.',
    color: 'from-green-600 to-green-700',
    category: 'Immunity',
    formulations: ['Giloy Sattva', 'Guduchi Ghana Vati', 'Amritarishta', 'Giloy Kadha', 'Giloy Juice'],
  },

  // ──────────────────────────────────
  // 10. Mulethi (Licorice)
  // ──────────────────────────────────
  {
    name: 'Mulethi (Licorice)',
    hindiName: 'मुलेठी (Mulethi / Jethimadh)',
    scientificName: 'Glycyrrhiza glabra',
    sanskritName: 'यष्टिमधु (Yashtimadhu – Sweet Stick)',
    desc: 'One of the most harmonizing and soothing herbs in Ayurveda. Mulethi is a natural demulcent that coats and heals inflamed mucous membranes of the throat, lungs, stomach, and urinary tract.',
    rasa: 'Sweet',
    virya: 'Cooling (Shita)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Pitta'],
    benefits: [
      'Soothes sore throat, dry cough, and hoarse voice',
      'Heals stomach ulcers and reduces gastric inflammation',
      'Supports adrenal gland function and fights fatigue',
      'Acts as a natural expectorant for respiratory clearing',
      'Enhances skin complexion and reduces pigmentation',
      'Supports vocal cord health and voice clarity',
    ],
    diseases: ['Sore Throat', 'Peptic Ulcers', 'Bronchitis', 'Dry Cough', 'Hyperacidity', 'Voice Hoarseness', 'Skin Pigmentation', 'Mouth Ulcers'],
    consumption: 'Chew a small stick of Mulethi, or take 1/4 tsp powder with honey. Boil in milk for a soothing drink.',
    precautions: 'Avoid prolonged use if you have hypertension (raises blood pressure). Not suitable for patients with edema or kidney disease.',
    color: 'from-orange-500 to-orange-600',
    category: 'Respiratory',
    formulations: ['Yashtimadhu Churna', 'Sitopaladi Churna', 'Yashtimadhu Ghrita', 'Khadiradi Vati'],
  },

  // ──────────────────────────────────
  // 11. Arjuna
  // ──────────────────────────────────
  {
    name: 'Arjuna',
    hindiName: 'अर्जुन (Arjun / Arjun ki Chhal)',
    scientificName: 'Terminalia arjuna',
    sanskritName: 'अर्जुन (The Bright / Shining One)',
    desc: 'The foremost cardiac tonic in Ayurveda, named after the legendary warrior. Arjuna bark strengthens the heart muscle, regulates blood pressure, and reduces cholesterol naturally.',
    rasa: 'Astringent',
    virya: 'Cooling (Shita)',
    vipaka: 'Pungent (Katu)',
    balances: ['Pitta', 'Kapha'],
    benefits: [
      'Strengthens cardiac muscles and improves heart function',
      'Reduces LDL cholesterol and triglycerides naturally',
      'Manages blood pressure and prevents atherosclerosis',
      'Heals wounds and reduces bleeding',
      'Acts as a natural antioxidant for cardiovascular protection',
      'Supports recovery after heart-related episodes',
    ],
    diseases: ['Heart Disease', 'Hypertension', 'High Cholesterol', 'Angina', 'Atherosclerosis', 'Cardiac Arrhythmia', 'Wound Bleeding'],
    consumption: 'Boil 1/2 tsp Arjuna bark powder in 1 cup milk + 1 cup water until reduced to 1 cup. Drink daily morning on empty stomach.',
    precautions: 'Consult cardiologist if already on heart medication. May interact with cardiac drugs. Start with low doses.',
    color: 'from-red-600 to-red-700',
    category: 'Heart & Circulation',
    formulations: ['Arjunarishta', 'Arjuna Churna', 'Arjuna Capsules', 'Arjuna Ksheer Pak'],
  },

  // ──────────────────────────────────
  // 12. Shankhapushpi
  // ──────────────────────────────────
  {
    name: 'Shankhapushpi',
    hindiName: 'शंखपुष्पी (Shankhpushpi)',
    scientificName: 'Convolvulus pluricaulis',
    sanskritName: 'शंखपुष्पी (Conch-Flower)',
    desc: 'A renowned Medhya Rasayana (brain tonic) prized for enhancing intellect, calming anxiety, and improving concentration. Its flowers resemble a conch shell. Widely used for children\'s cognitive development.',
    rasa: 'Astringent, Bitter',
    virya: 'Cooling (Shita)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Pitta', 'Kapha'],
    benefits: [
      'Enhances memory, concentration, and learning ability',
      'Calms anxiety and stress-related mental agitation',
      'Promotes restful, undisturbed sleep',
      'Supports cognitive development in children',
      'Helps manage epilepsy and convulsive disorders',
      'Improves attention span and mental stamina in students',
    ],
    diseases: ['Anxiety', 'Memory Loss', 'Insomnia', 'Epilepsy', 'ADHD in Children', 'Mental Fatigue', 'Stress', 'Hypertension'],
    consumption: 'Take 1/2 tsp Shankhapushpi Churna with warm milk before bed. For children, 1/4 tsp with honey.',
    precautions: 'May cause drowsiness. Do not drive or operate heavy machinery immediately after consuming. Avoid with thyroid medications.',
    color: 'from-violet-600 to-violet-700',
    category: 'Brain & Nerve',
    formulations: ['Shankhapushpi Syrup', 'Shankhapushpi Churna', 'Saraswatarishta', 'Shankhapushpi Tablets'],
  },

  // ──────────────────────────────────
  // 13. Guggulu
  // ──────────────────────────────────
  {
    name: 'Guggulu',
    hindiName: 'गुग्गुल (Guggul)',
    scientificName: 'Commiphora mukul (syn. Commiphora wightii)',
    sanskritName: 'गुग्गुलु (That Which Protects Against Disease)',
    desc: 'A powerful resin extract that is the backbone of many classical Ayurvedic formulations. Guggulu is famed for fat metabolism, cholesterol management, joint health, and deep tissue detoxification.',
    rasa: 'Bitter, Pungent, Astringent',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Vata', 'Kapha'],
    benefits: [
      'Reduces LDL cholesterol and supports lipid metabolism',
      'Relieves joint pain and stiffness in arthritis',
      'Supports thyroid function and metabolic rate',
      'Promotes weight loss by enhancing fat burning',
      'Detoxifies deep tissues and removes Ama (toxins)',
      'Supports healthy skin and reduces cystic acne',
    ],
    diseases: ['High Cholesterol', 'Obesity', 'Arthritis', 'Hypothyroidism', 'Sciatica', 'Lipoma', 'Cystic Acne', 'Gout'],
    consumption: 'Take Guggulu tablets (500mg) twice daily after meals with warm water. Best used in compound formulations.',
    precautions: 'Can increase Pitta in excess. Avoid during pregnancy. May interact with thyroid and cholesterol medications.',
    color: 'from-stone-600 to-stone-700',
    category: 'Bone & Joint',
    formulations: ['Yograj Guggulu', 'Kaishore Guggulu', 'Triphala Guggulu', 'Kanchnar Guggulu', 'Medohar Guggulu'],
  },

  // ──────────────────────────────────
  // 14. Kutki
  // ──────────────────────────────────
  {
    name: 'Kutki',
    hindiName: 'कुटकी (Kutki / Katuki)',
    scientificName: 'Picrorhiza kurroa',
    sanskritName: 'कटुकी (Katuki – The Bitter One)',
    desc: 'The most potent hepatoprotective herb in Ayurveda. Kutki is a rare Himalayan bitter root that deeply cleanses the liver, stimulates bile flow, and treats chronic liver diseases and skin conditions.',
    rasa: 'Bitter',
    virya: 'Cooling (Shita)',
    vipaka: 'Pungent (Katu)',
    balances: ['Pitta', 'Kapha'],
    benefits: [
      'Protects and regenerates liver cells (hepatoprotective)',
      'Stimulates healthy bile flow and fat digestion',
      'Treats chronic skin diseases by purifying blood',
      'Reduces inflammation in the liver and GI tract',
      'Supports recovery from jaundice and hepatitis',
      'Helps manage allergic asthma and immune hypersensitivity',
    ],
    diseases: ['Jaundice', 'Hepatitis', 'Fatty Liver', 'Skin Diseases', 'Chronic Fever', 'Allergic Asthma', 'Anemia', 'Loss of Appetite'],
    consumption: 'Take 250-500mg Kutki Churna with honey or warm water before meals, twice daily.',
    precautions: 'Should not be used long-term without supervision. Avoid in extremely low-weight individuals. Can cause loose stools initially.',
    color: 'from-cyan-600 to-cyan-700',
    category: 'Liver & Detox',
    formulations: ['Arogyavardhini Vati', 'Kutki Churna', 'Tikta Ghrita', 'Katuki Kand'],
  },

  // ──────────────────────────────────
  // 15. Punarnava
  // ──────────────────────────────────
  {
    name: 'Punarnava',
    hindiName: 'पुनर्नवा (Punarnava / Saath / Gadahpurna)',
    scientificName: 'Boerhavia diffusa',
    sanskritName: 'पुनर्नवा (That Which Renews the Body)',
    desc: 'A legendary rejuvenating herb whose name literally means "the one that makes new again." Punarnava is the premier kidney and urinary tonic — renowned for reducing edema, supporting kidney filtration, and renewing vitality.',
    rasa: 'Bitter, Sweet, Astringent',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Kapha', 'Vata'],
    benefits: [
      'Reduces water retention and edema naturally',
      'Supports kidney function and urinary health',
      'Detoxifies urinary tract and prevents infections',
      'Rejuvenates the body and restores vitality',
      'Supports healthy heart function by reducing fluid load',
      'Manages ascites and inflammatory joint conditions',
    ],
    diseases: ['Edema', 'Kidney Disorders', 'UTI', 'Ascites', 'Swollen Joints', 'Obesity', 'Anemia', 'Heart Failure (supportive)'],
    consumption: 'Take 1/2 tsp Punarnava Churna in warm water twice daily. Punarnava juice (15ml) also effective.',
    precautions: 'Avoid in severe dehydration. Consult doctor if on diuretic medication. May lower blood pressure.',
    color: 'from-sky-600 to-sky-700',
    category: 'Liver & Detox',
    formulations: ['Punarnavadi Mandur', 'Punarnava Churna', 'Punarnavadi Kwath', 'Punarnava Guggulu'],
  },

  // ──────────────────────────────────
  // 16. Shilajit
  // ──────────────────────────────────
  {
    name: 'Shilajit',
    hindiName: 'शिलाजीत (Shilajit / Silajit)',
    scientificName: 'Asphaltum punjabinum (Mineral Pitch)',
    sanskritName: 'शिलाजतु (Shilajatu – Conqueror of Mountains)',
    desc: 'A rare mineral-rich exudate found oozing from Himalayan rocks at high altitudes. Known as the "Destroyer of Weakness," Shilajit is the supreme vitality and virility enhancer in Ayurveda, containing 80+ minerals and fulvic acid.',
    rasa: 'Bitter, Astringent, Pungent',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Vata', 'Kapha'],
    benefits: [
      'Enhances physical strength, stamina, and endurance',
      'Boosts testosterone and male reproductive health',
      'Improves mitochondrial energy production at cellular level',
      'Rich in fulvic acid — enhances nutrient absorption',
      'Supports bone density and prevents osteoporosis',
      'Anti-aging Rasayana — delays cellular degeneration',
    ],
    diseases: ['Weakness', 'Low Energy', 'Erectile Dysfunction', 'Anemia', 'Diabetes', 'Kidney Stones', 'Osteoporosis', 'Infertility'],
    consumption: 'Dissolve a pea-sized amount (300-500mg) of pure Shilajit resin in warm milk or water. Take once daily.',
    precautions: 'Use only purified Shuddha Shilajit. Avoid with high uric acid levels (gout). Not for children under 12. Never consume raw form.',
    color: 'from-zinc-700 to-zinc-800',
    category: 'Men\'s Health',
    formulations: ['Shilajit Vati', 'Shilajit Capsules', 'Chandraprabha Vati', 'Shilajit Rasayana'],
  },

  // ──────────────────────────────────
  // 17. Safed Musli
  // ──────────────────────────────────
  {
    name: 'Safed Musli',
    hindiName: 'सफेद मूसली (Safed Musli)',
    scientificName: 'Chlorophytum borivilianum',
    sanskritName: 'मूसली (Musali – The White Gold)',
    desc: 'Known as "White Gold" or "Divya Aushad" (Divine Herb). Safed Musli is a premium Vajikarana (aphrodisiac) herb that enhances vitality, stamina, and reproductive health in both men and women.',
    rasa: 'Sweet',
    virya: 'Cooling (Shita)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Pitta'],
    benefits: [
      'Enhances male reproductive health and sperm quality',
      'Increases physical stamina and muscular strength',
      'Acts as a natural aphrodisiac and vitality booster',
      'Supports lactation in nursing mothers',
      'Strengthens immunity and combats general weakness',
      'Promotes healthy weight gain in underweight individuals',
    ],
    diseases: ['Erectile Dysfunction', 'Low Sperm Count', 'General Weakness', 'Low Stamina', 'Arthritis', 'Diabetes', 'Lactation Issues'],
    consumption: 'Take 1/2 tsp Safed Musli powder with warm milk and mishri (rock sugar) at bedtime.',
    precautions: 'May cause weight gain if used in excess. Not suitable for Kapha-dominant body types with congestion.',
    color: 'from-slate-500 to-slate-600',
    category: 'Men\'s Health',
    formulations: ['Musli Pak', 'Musli Churna', 'Musli Capsules', 'Musli Khamira'],
  },

  // ──────────────────────────────────
  // 18. Bhumi Amla
  // ──────────────────────────────────
  {
    name: 'Bhumi Amla',
    hindiName: 'भूमि आंवला (Bhumyamalaki)',
    scientificName: 'Phyllanthus niruri',
    sanskritName: 'भूम्यामलकी (Bhumyamalaki – Ground Amla)',
    desc: 'A small but mighty herb that grows close to the ground, resembling a miniature Amla plant. It is Ayurveda\'s most targeted liver protector and kidney stone dissolver, used extensively in hepatic disorders.',
    rasa: 'Bitter, Astringent, Sweet',
    virya: 'Cooling (Shita)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Pitta', 'Kapha'],
    benefits: [
      'Protects the liver from drug and toxin damage',
      'Helps dissolve kidney and urinary stones naturally',
      'Treats Hepatitis B and supports liver regeneration',
      'Reduces blood sugar levels in diabetic patients',
      'Clears urinary tract infections and inflammation',
      'Anti-viral properties — effective against Hepatitis viruses',
    ],
    diseases: ['Kidney Stones', 'Hepatitis B', 'Jaundice', 'Fatty Liver', 'UTI', 'Diabetes', 'Gallstones', 'Liver Cirrhosis (early)'],
    consumption: 'Take 1/2 tsp Bhumi Amla powder with water twice daily on empty stomach. Fresh juice (10ml) is also effective.',
    precautions: 'May lower blood sugar — monitor if diabetic. Avoid in pregnancy. Long-term use should be supervised.',
    color: 'from-emerald-500 to-emerald-600',
    category: 'Liver & Detox',
    formulations: ['Bhumyamalaki Churna', 'Arogyavardhini Vati', 'Bhumi Amla Juice', 'Hepatoprotective Kwath'],
  },

  // ──────────────────────────────────
  // 19. Vidanga
  // ──────────────────────────────────
  {
    name: 'Vidanga',
    hindiName: 'वायविडंग (Vaividang / Baberang)',
    scientificName: 'Embelia ribes',
    sanskritName: 'विडंग (Vidanga – The Worm Destroyer)',
    desc: 'The most powerful natural anthelmintic (deworming) herb in Ayurveda. Vidanga is also an excellent digestive stimulant and detoxifier used for parasitic infections and metabolic disorders.',
    rasa: 'Pungent, Astringent',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Kapha', 'Vata'],
    benefits: [
      'Eliminates intestinal worms and parasites effectively',
      'Stimulates digestion and corrects sluggish Agni (fire)',
      'Reduces abdominal bloating and flatulence',
      'Supports weight loss and fat metabolism',
      'Has anti-fungal and antimicrobial properties',
      'Treats skin infections caused by parasites',
    ],
    diseases: ['Intestinal Worms', 'Parasitic Infections', 'Bloating', 'Obesity', 'Fungal Infections', 'Skin Worms', 'Constipation'],
    consumption: 'Take 1/4 tsp Vidanga Churna with honey on empty stomach for 7-14 days for deworming. Mix with Triphala for digestion.',
    precautions: 'Avoid during pregnancy. Not for children under 5 without physician guidance. Can increase Pitta in excess.',
    color: 'from-rose-600 to-rose-700',
    category: 'Digestive',
    formulations: ['Vidangadi Churna', 'Vidanga Churna', 'Krimikuthar Ras', 'Vidangasava'],
  },

  // ──────────────────────────────────
  // 20. Haritaki
  // ──────────────────────────────────
  {
    name: 'Haritaki',
    hindiName: 'हरड़ (Harad / Haritaki)',
    scientificName: 'Terminalia chebula',
    sanskritName: 'हरीतकी (Haritaki – Remover of Diseases)',
    desc: 'Known as the "King of Medicines" in Tibetan Buddhism and revered in Ayurveda as a supreme Rasayana. Haritaki is one of the three fruits in Triphala and is the most effective mild laxative and tissue rejuvenator.',
    rasa: 'Astringent, Sweet, Sour, Pungent, Bitter (all 5 tastes)',
    virya: 'Heating (Ushna)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Pitta', 'Kapha'],
    benefits: [
      'Gentle daily laxative — regulates bowel movements naturally',
      'Rejuvenates all seven body tissues (Sapta Dhatu)',
      'Enhances digestive fire (Agni) without aggravating Pitta',
      'Improves eyesight and treats eye disorders',
      'Supports longevity and slows the aging process',
      'Clears accumulated toxins (Ama) from deep tissues',
    ],
    diseases: ['Constipation', 'Piles', 'Eye Disorders', 'Indigestion', 'Cough', 'Asthma', 'Skin Diseases', 'Obesity'],
    consumption: 'Take 1/2 tsp Haritaki Churna with warm water at bedtime. For eye wash, boil in water, strain, and cool.',
    precautions: 'Avoid during pregnancy, severe dehydration, or acute diarrhea. Not for extremely thin or malnourished individuals.',
    color: 'from-amber-600 to-amber-700',
    category: 'Digestive',
    formulations: ['Haritaki Churna', 'Triphala Churna', 'Abhayarishta', 'Agastya Haritaki Lehyam'],
  },

  // ──────────────────────────────────
  // 21. Manjistha
  // ──────────────────────────────────
  {
    name: 'Manjistha',
    hindiName: 'मंजीठा (Manjith / Manjistha)',
    scientificName: 'Rubia cordifolia',
    sanskritName: 'मंजिष्ठा (Manjishtha – The Radiance Herb)',
    desc: 'The supreme blood purifier and lymphatic cleanser in Ayurveda. Manjistha gives radiant skin, clears acne, reduces pigmentation, and detoxifies the Rakta (blood) and lymphatic systems.',
    rasa: 'Bitter, Astringent, Sweet',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Pitta', 'Kapha'],
    benefits: [
      'Purifies blood and clears skin from within',
      'Reduces dark spots, pigmentation, and uneven skin tone',
      'Detoxifies the lymphatic system and resolves swelling',
      'Treats acne, rashes, and inflammatory skin conditions',
      'Supports healthy menstrual flow and reduces cramps',
      'Promotes wound healing and reduces scar formation',
    ],
    diseases: ['Acne', 'Pigmentation', 'Eczema', 'Psoriasis', 'Irregular Periods', 'Blood Impurities', 'Urticaria', 'Wounds'],
    consumption: 'Take 1/4-1/2 tsp Manjistha Churna with warm water or honey twice daily after meals.',
    precautions: 'May turn urine slightly reddish (harmless). Avoid during heavy menstrual bleeding. Not recommended in pregnancy.',
    color: 'from-red-500 to-red-600',
    category: 'Skin & Blood',
    formulations: ['Manjisthadi Kwath', 'Mahamanjisthadi Kwath', 'Manjistha Churna', 'Khadirarishta'],
  },

  // ──────────────────────────────────
  // 22. Jatamansi
  // ──────────────────────────────────
  {
    name: 'Jatamansi',
    hindiName: 'जटामांसी (Jatamansi / Baalchhar)',
    scientificName: 'Nardostachys jatamansi',
    sanskritName: 'जटामांसी (Jatamansi – Matted Hair Herb)',
    desc: 'A rare Himalayan calming herb known as "Indian Spikenard." Jatamansi is one of the most powerful natural tranquilizers in Ayurveda, prized for calming the mind, treating insomnia, and purifying the complexion.',
    rasa: 'Bitter, Astringent, Sweet',
    virya: 'Cooling (Shita)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Pitta', 'Kapha'],
    benefits: [
      'Treats insomnia and induces deep, restorative sleep',
      'Calms anxiety, panic attacks, and nervous restlessness',
      'Improves complexion and reduces dark circles',
      'Promotes hair growth and prevents premature greying',
      'Supports memory and brain function in the elderly',
      'Balances blood pressure in hypertension',
    ],
    diseases: ['Insomnia', 'Anxiety', 'Depression', 'Hypertension', 'Epilepsy', 'Dark Circles', 'Premature Greying', 'Palpitations'],
    consumption: 'Take 250-500mg Jatamansi Churna with warm milk 30 minutes before bed. Can also be used as hair oil.',
    precautions: 'May cause excessive drowsiness. Avoid driving after consumption. Not recommended during pregnancy.',
    color: 'from-indigo-600 to-indigo-700',
    category: 'Brain & Nerve',
    formulations: ['Jatamansi Churna', 'Jatamansi Oil', 'Saraswatarishta', 'Manasamitra Vatakam'],
  },

  // ──────────────────────────────────
  // 23. Vacha (Calamus)
  // ──────────────────────────────────
  {
    name: 'Vacha (Calamus)',
    hindiName: 'वच (Bach / Ghorbach)',
    scientificName: 'Acorus calamus',
    sanskritName: 'वचा (Vacha – Speech / Voice)',
    desc: 'A potent brain-stimulating and speech-enhancing herb used since Vedic times. Vacha improves voice quality, treats speech disorders, enhances memory, and clears sinus congestion.',
    rasa: 'Pungent, Bitter',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Kapha', 'Vata'],
    benefits: [
      'Enhances speech clarity, voice quality, and articulation',
      'Stimulates intellect and improves memory power',
      'Clears sinus congestion and nasal passages',
      'Treats stammering and speech delays in children',
      'Supports digestive fire and reduces bloating',
      'Acts as a nerve stimulant and brain awakener',
    ],
    diseases: ['Speech Disorders', 'Stammering', 'Memory Loss', 'Sinusitis', 'Epilepsy', 'Bloating', 'Depression', 'Nasal Polyps'],
    consumption: 'Take a pinch (125-250mg) of Vacha Churna with honey. For children, apply paste on tongue with honey.',
    precautions: 'Use only in very small doses — excess can cause nausea. Avoid during pregnancy. Use only Acorus calamus var. americanus (lower beta-asarone).',
    color: 'from-purple-600 to-purple-700',
    category: 'Brain & Nerve',
    formulations: ['Vacha Churna', 'Saraswata Churna', 'Vachadhi Churna', 'Saraswatarishta'],
  },

  // ──────────────────────────────────
  // 24. Gokshura (Tribulus)
  // ──────────────────────────────────
  {
    name: 'Gokshura (Tribulus)',
    hindiName: 'गोखरू (Gokhru / Gokharu)',
    scientificName: 'Tribulus terrestris',
    sanskritName: 'गोक्षुर (Gokshura – Cow\'s Hoof)',
    desc: 'A powerful Mutrala (diuretic) and Vajikarana (aphrodisiac) herb. Gokshura supports kidney and urinary function while enhancing vitality and athletic performance naturally.',
    rasa: 'Sweet',
    virya: 'Cooling (Shita)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Pitta'],
    benefits: [
      'Supports healthy urinary tract and kidney filtration',
      'Helps dissolve urinary stones and reduces crystallization',
      'Enhances testosterone and reproductive vitality',
      'Boosts stamina and athletic performance naturally',
      'Reduces prostate enlargement symptoms (BPH)',
      'Acts as a natural diuretic without depleting potassium',
    ],
    diseases: ['Kidney Stones', 'UTI', 'BPH (Prostate)', 'Low Libido', 'Infertility', 'Dysuria', 'Edema', 'Polycystic Kidney'],
    consumption: 'Take 1/2 tsp Gokshura Churna with warm milk or water twice daily. Gokshuradi Guggulu tablets also effective.',
    precautions: 'May interact with diabetes and blood pressure medications. Avoid in dehydration. Not recommended during pregnancy.',
    color: 'from-teal-500 to-teal-600',
    category: 'Men\'s Health',
    formulations: ['Gokshuradi Guggulu', 'Gokshura Churna', 'Chandraprabha Vati', 'Gokshuradi Kwath'],
  },

  // ──────────────────────────────────
  // 25. Pippali (Long Pepper)
  // ──────────────────────────────────
  {
    name: 'Pippali (Long Pepper)',
    hindiName: 'पिप्पली (Pipli / Pipal)',
    scientificName: 'Piper longum',
    sanskritName: 'पिप्पली (Pippali – The Bioenhancer)',
    desc: 'A unique spice that acts as a "Yogavahi" — a bioenhancer that increases the absorption and efficacy of other herbs and medicines. Pippali kindles digestive fire and is the primary herb for Kapha and respiratory disorders.',
    rasa: 'Pungent',
    virya: 'Heating (Ushna) — but becomes cooling after chronic use (unique property)',
    vipaka: 'Sweet (Madhura) — unique for a pungent herb',
    balances: ['Kapha', 'Vata'],
    benefits: [
      'Kindles digestive fire (Agni) and improves appetite',
      'Acts as a bioenhancer — increases absorption of other herbs',
      'Clears respiratory congestion and treats chronic cough',
      'Supports metabolism and aids in healthy weight management',
      'Rejuvenates the lungs and strengthens respiratory system',
      'Treats cold, asthma, and bronchial wheezing',
    ],
    diseases: ['Asthma', 'Bronchitis', 'Loss of Appetite', 'Indigestion', 'Cold', 'Cough', 'Low Metabolism', 'Worm Infestation'],
    consumption: 'Take a pinch (250mg) of Pippali powder with honey before meals. Vardhamana Pippali (graduated dosing) for chronic conditions.',
    precautions: 'Avoid in high Pitta conditions (hyperacidity, ulcers). Start with very low doses. Not for use during active inflammation.',
    color: 'from-orange-600 to-orange-700',
    category: 'Digestive',
    formulations: ['Trikatu Churna', 'Sitopaladi Churna', 'Pippalyasava', 'Vardhamana Pippali Rasayana'],
  },

  // ──────────────────────────────────
  // 26. Chitrak
  // ──────────────────────────────────
  {
    name: 'Chitrak',
    hindiName: 'चित्रक (Chitraka / Chita)',
    scientificName: 'Plumbago zeylanica',
    sanskritName: 'चित्रक (Chitraka – The Spotted / Bright One)',
    desc: 'The most potent digestive fire (Agni) stimulant in Ayurveda. Chitrak root ignites metabolic fire, dissolves Ama (toxins), and is critical in treating stubborn digestive and metabolic disorders.',
    rasa: 'Pungent',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Kapha', 'Vata'],
    benefits: [
      'Ignites digestive fire (Agni Deepan) powerfully',
      'Dissolves Ama (metabolic toxins) at the deepest levels',
      'Treats stubborn abdominal distension and bloating',
      'Supports healthy metabolism and thyroid function',
      'Aids in treatment of piles and hemorrhoids',
      'Reduces Kapha-type obesity and sluggishness',
    ],
    diseases: ['Indigestion', 'Loss of Appetite', 'Piles', 'Abdominal Distension', 'Obesity', 'Rheumatism', 'Edema', 'Worm Infestation'],
    consumption: 'Take 250-500mg Chitrak Churna with buttermilk or warm water before meals. Best used in compound formulations.',
    precautions: 'Very heating — never exceed recommended doses. Avoid during pregnancy, hyperacidity, and bleeding disorders. Use only root powder.',
    color: 'from-red-700 to-red-800',
    category: 'Digestive',
    formulations: ['Chitrakadi Vati', 'Chitrak Haritaki', 'Agnitundi Vati', 'Chitrakadi Ghrita'],
  },

  // ──────────────────────────────────
  // 27. Bala
  // ──────────────────────────────────
  {
    name: 'Bala',
    hindiName: 'बला (Bala / Kharenti)',
    scientificName: 'Sida cordifolia',
    sanskritName: 'बला (Bala – Strength)',
    desc: 'A prime Balya (strength-building) and Ojas-enhancing herb. Bala strengthens muscles, nerves, and the reproductive system. It is the go-to herb for weakness, nerve damage, and paralysis recovery.',
    rasa: 'Sweet',
    virya: 'Cooling (Shita)',
    vipaka: 'Sweet (Madhura)',
    balances: ['Vata', 'Pitta'],
    benefits: [
      'Builds physical strength and muscle mass naturally',
      'Nourishes and repairs the nervous system',
      'Supports recovery from paralysis and nerve damage',
      'Enhances reproductive health and Ojas (vital energy)',
      'Reduces Vata-type body pain and neuralgia',
      'Acts as a cardiac tonic and strengthens heart muscles',
    ],
    diseases: ['Muscle Weakness', 'Paralysis', 'Nerve Damage', 'Sciatica', 'General Debility', 'Infertility', 'Heart Weakness', 'Neuralgia'],
    consumption: 'Take 1/2 tsp Bala Churna with warm milk and ghee twice daily. Bala Taila for external oil massage.',
    precautions: 'Contains ephedrine-like compounds; avoid in hypertension and heart conditions. Not suitable for Kapha-dominant individuals.',
    color: 'from-pink-500 to-pink-600',
    category: 'Bone & Joint',
    formulations: ['Bala Taila', 'Balarishtam', 'Bala Churna', 'Mahabala Taila', 'Ashwagandha Bala Lakshadi Taila'],
  },

  // ──────────────────────────────────
  // 28. Lodhra
  // ──────────────────────────────────
  {
    name: 'Lodhra',
    hindiName: 'लोध्र (Lodh / Lodh Pathani)',
    scientificName: 'Symplocos racemosa',
    sanskritName: 'लोध्र (Lodhra – The Astringent Healer)',
    desc: 'An exceptional Stambhana (astringent) herb primarily used in women\'s health. Lodhra bark controls excessive menstrual bleeding, treats PCOS/PCOD, and improves skin complexion from within.',
    rasa: 'Astringent',
    virya: 'Cooling (Shita)',
    vipaka: 'Pungent (Katu)',
    balances: ['Pitta', 'Kapha'],
    benefits: [
      'Controls heavy menstrual bleeding (Menorrhagia)',
      'Treats PCOS/PCOD and balances female hormones',
      'Improves skin complexion and reduces acne',
      'Heals diarrhea and dysentery (astringent action)',
      'Supports liver health and reduces inflammation',
      'Strengthens uterine tissues and reproductive health',
    ],
    diseases: ['Menorrhagia', 'PCOS/PCOD', 'Acne', 'Diarrhea', 'Dysentery', 'Leucorrhea', 'Uterine Disorders', 'Liver Inflammation'],
    consumption: 'Take 1/2 tsp Lodhra bark powder with warm water or honey twice daily after meals.',
    precautions: 'Avoid during pregnancy and if trying to conceive. May cause constipation in excess due to astringent nature.',
    color: 'from-fuchsia-600 to-fuchsia-700',
    category: 'Women\'s Health',
    formulations: ['Lodhra Churna', 'Lodhrasava', 'Pushyanug Churna', 'Ashokarishta (with Lodhra)'],
  },

  // ──────────────────────────────────
  // 29. Ashoka
  // ──────────────────────────────────
  {
    name: 'Ashoka',
    hindiName: 'अशोक (Ashok / Ashoka)',
    scientificName: 'Saraca asoca (syn. Saraca indica)',
    sanskritName: 'अशोक (Ashoka – Remover of Sorrow)',
    desc: 'The tree that relieves the "Shoka" (sorrow) of women. Ashoka bark is the most important herb for uterine health in Ayurveda — it regulates menstruation, reduces pain, and is the primary remedy for uterine fibroids.',
    rasa: 'Astringent, Bitter',
    virya: 'Cooling (Shita)',
    vipaka: 'Pungent (Katu)',
    balances: ['Pitta', 'Kapha'],
    benefits: [
      'Regulates menstrual cycle and reduces painful periods',
      'Controls excessive uterine bleeding naturally',
      'Treats uterine fibroids and endometriosis (supportive)',
      'Balances estrogen levels and supports hormonal health',
      'Relieves white discharge (Leucorrhea)',
      'Supports emotional well-being and reduces menstrual mood swings',
    ],
    diseases: ['Dysmenorrhea', 'Menorrhagia', 'Uterine Fibroids', 'Leucorrhea', 'PCOS', 'Endometriosis', 'Amenorrhea', 'Menstrual Pain'],
    consumption: 'Take Ashokarishta (liquid) 15-20ml with equal water after meals twice daily. Or 1/2 tsp Ashoka bark powder with water.',
    precautions: 'Avoid during pregnancy. Not suitable for women trying to conceive without supervision. May delay periods in some women.',
    color: 'from-pink-600 to-pink-700',
    category: 'Women\'s Health',
    formulations: ['Ashokarishta', 'Ashoka Churna', 'Ashoka Ghrita', 'Pushyanug Churna'],
  },

  // ──────────────────────────────────
  // 30. Gudmar (Gymnema)
  // ──────────────────────────────────
  {
    name: 'Gudmar (Gymnema)',
    hindiName: 'गुड़मार (Gudmar / Madhunashini)',
    scientificName: 'Gymnema sylvestre',
    sanskritName: 'मधुनाशिनी (Madhunashini – Destroyer of Sugar)',
    desc: 'Its name literally means "Sugar Destroyer" — chewing Gudmar leaves temporarily disables the ability to taste sweetness. It is the single most effective herb for managing Type 2 Diabetes and sugar cravings.',
    rasa: 'Astringent, Bitter',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Kapha', 'Vata'],
    benefits: [
      'Reduces blood sugar levels naturally in Type 2 diabetes',
      'Suppresses sugar cravings and sweet taste perception',
      'Supports pancreatic beta cell regeneration',
      'Aids in healthy weight loss by reducing carb absorption',
      'Lowers LDL cholesterol and triglycerides',
      'Supports insulin sensitivity and glucose metabolism',
    ],
    diseases: ['Type 2 Diabetes', 'Sugar Cravings', 'Obesity', 'High Cholesterol', 'Metabolic Syndrome', 'Pre-Diabetes', 'Insulin Resistance'],
    consumption: 'Take 500mg Gudmar leaf powder or 1 tablet with water before meals, twice daily. Chew fresh leaf to experience sugar-blocking effect.',
    precautions: 'Monitor blood sugar closely if on diabetic medication — may cause hypoglycemia. Avoid during pregnancy and breastfeeding.',
    color: 'from-green-700 to-green-800',
    category: 'Digestive',
    formulations: ['Gudmar Churna', 'Madhumehari Granules', 'Gudmar Capsules', 'Chandraprabha Vati'],
  },

  // ──────────────────────────────────
  // 31. Kachnar (Bauhinia)
  // ──────────────────────────────────
  {
    name: 'Kachnar (Bauhinia)',
    hindiName: 'कचनार (Kachnar / Kaniar)',
    scientificName: 'Bauhinia variegata',
    sanskritName: 'कांचनार (Kanchnar – The Golden)',
    desc: 'The primary herb for glandular swellings, thyroid disorders, and tumor-like growths. Kachnar bark is indispensable in treating goiter, PCOS, lipomas, fibroids, and lymphatic blockages.',
    rasa: 'Astringent',
    virya: 'Cooling (Shita)',
    vipaka: 'Pungent (Katu)',
    balances: ['Kapha', 'Pitta'],
    benefits: [
      'Treats thyroid disorders (both hypo and hyperthyroidism)',
      'Dissolves glandular swellings, lipomas, and cysts',
      'Supports treatment of PCOS and uterine fibroids',
      'Reduces lymphatic congestion and neck swellings',
      'Helps manage benign tumors and abnormal growths',
      'Heals skin diseases and chronic wounds',
    ],
    diseases: ['Thyroid Disorders', 'Goiter', 'Lipoma', 'PCOS', 'Uterine Fibroids', 'Lymphadenitis', 'Tumors (benign)', 'Obesity'],
    consumption: 'Take Kanchnar Guggulu tablets (2 tablets) twice daily with warm water after meals. Bark decoction also effective.',
    precautions: 'Should be used under Ayurvedic practitioner guidance for thyroid conditions. Monitor thyroid levels regularly.',
    color: 'from-purple-500 to-purple-600',
    category: 'Immunity',
    formulations: ['Kanchnar Guggulu', 'Kanchnar Kwath', 'Kanchnar Churna', 'Gandmala Kandan Ras'],
  },

  // ──────────────────────────────────
  // 32. Tagar (Indian Valerian)
  // ──────────────────────────────────
  {
    name: 'Tagar (Indian Valerian)',
    hindiName: 'तगर (Tagar / Mushkbala)',
    scientificName: 'Valeriana wallichii',
    sanskritName: 'तगर (Tagara – The Sleep Herb)',
    desc: 'The Indian counterpart of European Valerian. Tagar is the most effective natural sleep aid in Ayurveda — it calms Vata, relaxes muscles, and induces deep, dreamless sleep without morning grogginess.',
    rasa: 'Bitter, Pungent',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Vata', 'Kapha'],
    benefits: [
      'Induces natural, deep sleep without sedation hangover',
      'Relaxes skeletal muscles and reduces tension headaches',
      'Calms restless thoughts and racing mind',
      'Supports treatment of epilepsy and convulsions',
      'Reduces nerve pain and neuralgia',
      'Helps manage withdrawal from sleeping pills',
    ],
    diseases: ['Insomnia', 'Anxiety', 'Muscle Spasms', 'Tension Headaches', 'Epilepsy', 'Restless Legs', 'Nerve Pain', 'Hysteria'],
    consumption: 'Take 250-500mg Tagar Churna with warm milk 30-60 minutes before bed.',
    precautions: 'May cause excessive drowsiness. Do not drive after consumption. Avoid combining with alcohol or sedatives.',
    color: 'from-indigo-500 to-indigo-600',
    category: 'Brain & Nerve',
    formulations: ['Tagar Churna', 'Tagara Tablets', 'Sarpagandha Ghan Vati (with Tagar)', 'Manasamitra Vatakam'],
  },

  // ──────────────────────────────────
  // 33. Ajwain (Bishop's Weed)
  // ──────────────────────────────────
  {
    name: 'Ajwain (Bishop\'s Weed)',
    hindiName: 'अजवाइन (Ajwain)',
    scientificName: 'Trachyspermum ammi',
    sanskritName: 'यवानी (Yavani – The Digestive Seed)',
    desc: 'A common kitchen spice that is also a potent Ayurvedic medicine. Ajwain seeds contain thymol, a powerful antimicrobial. It is the fastest-acting remedy for gas, bloating, and stomach pain.',
    rasa: 'Pungent, Bitter',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Kapha', 'Vata'],
    benefits: [
      'Instantly relieves gas, bloating, and flatulence',
      'Kills stomach pathogens with thymol content',
      'Improves appetite and stimulates digestive enzymes',
      'Treats colic pain in infants (Ajwain water)',
      'Relieves menstrual cramps and abdominal spasms',
      'Clears nasal congestion when inhaled as steam',
    ],
    diseases: ['Gas', 'Bloating', 'Indigestion', 'Stomach Pain', 'Colic', 'Menstrual Cramps', 'Common Cold', 'Asthma'],
    consumption: 'Chew 1/2 tsp Ajwain seeds with warm water after meals. For colic, boil in water and give 1 tsp to infants.',
    precautions: 'Avoid in hyperacidity and peptic ulcers. Can increase Pitta in excess. Not for use during pregnancy in large amounts.',
    color: 'from-yellow-600 to-yellow-700',
    category: 'Digestive',
    formulations: ['Ajwain Churna', 'Hingwashtak Churna', 'Ajwain Ark', 'Lavanbhaskar Churna'],
  },

  // ──────────────────────────────────
  // 34. Methi (Fenugreek)
  // ──────────────────────────────────
  {
    name: 'Methi (Fenugreek)',
    hindiName: 'मेथी (Methi)',
    scientificName: 'Trigonella foenum-graecum',
    sanskritName: 'मेथिका (Methika – The Galactagogue)',
    desc: 'A humble kitchen staple that is a powerful medicine. Methi seeds control blood sugar, improve lactation, reduce joint pain, and support hair growth. One of the safest herbs for daily use.',
    rasa: 'Bitter, Pungent',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Vata', 'Kapha'],
    benefits: [
      'Lowers blood sugar and improves insulin sensitivity',
      'Increases breast milk production in nursing mothers',
      'Reduces joint pain and inflammation naturally',
      'Promotes hair growth and reduces hair fall',
      'Supports healthy cholesterol and lipid levels',
      'Aids digestion and treats chronic constipation',
    ],
    diseases: ['Diabetes', 'Low Lactation', 'Arthritis', 'Hair Loss', 'High Cholesterol', 'Constipation', 'PCOS', 'Obesity'],
    consumption: 'Soak 1 tsp Methi seeds overnight in water. Drink the water and chew seeds on empty stomach. Or take 1/2 tsp powder with water.',
    precautions: 'May cause uterine contractions — avoid in pregnancy. Can interact with diabetes medications. May cause body odor in some.',
    color: 'from-amber-500 to-amber-600',
    category: 'Women\'s Health',
    formulations: ['Methi Churna', 'Methi Dana (seeds)', 'Methi Capsules', 'Methi Laddoo'],
  },

  // ──────────────────────────────────
  // 35. Kalonji (Black Seed)
  // ──────────────────────────────────
  {
    name: 'Kalonji (Black Seed)',
    hindiName: 'कलौंजी (Kalonji / Mangreliya)',
    scientificName: 'Nigella sativa',
    sanskritName: 'कृष्णजीरक (Krishnajeeraka – Black Cumin)',
    desc: 'Known in traditional medicine as "Habbatus Sauda" — the seed that cures everything except death. Kalonji contains thymoquinone, a compound with powerful anti-cancer, anti-diabetic, and immunomodulatory properties.',
    rasa: 'Pungent, Bitter',
    virya: 'Heating (Ushna)',
    vipaka: 'Pungent (Katu)',
    balances: ['Kapha', 'Vata'],
    benefits: [
      'Boosts immunity and fights autoimmune disorders',
      'Reduces blood sugar and supports diabetes management',
      'Has potent anti-cancer properties (thymoquinone)',
      'Supports respiratory health and treats asthma',
      'Improves memory and cognitive function',
      'Promotes hair growth and reduces greying',
    ],
    diseases: ['Diabetes', 'Asthma', 'Allergies', 'Hair Loss', 'Cancer (supportive)', 'Weak Immunity', 'Hypertension', 'Skin Diseases'],
    consumption: 'Take 1/2 tsp Kalonji seeds with honey on empty stomach daily. Kalonji oil: 1 tsp with warm water or milk.',
    precautions: 'Avoid in pregnancy (can stimulate uterine contractions). May interact with blood-thinning medications.',
    color: 'from-gray-700 to-gray-800',
    category: 'Immunity',
    formulations: ['Kalonji Oil', 'Kalonji Seeds', 'Kalonji Capsules', 'Kalonji Honey Mix'],
  },
];

export const HERB_CATEGORIES = [
  'All',
  'Adaptogen',
  'Brain & Nerve',
  'Digestive',
  'Respiratory',
  'Skin & Blood',
  'Immunity',
  'Women\'s Health',
  'Men\'s Health',
  'Heart & Circulation',
  'Bone & Joint',
  'Liver & Detox',
  'Anti-Inflammatory',
] as const;

export type HerbCategory = typeof HERB_CATEGORIES[number];
