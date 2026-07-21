// Medical Report Parser Engine supporting dynamic extraction, clinical boundaries, and Ayurvedic insights

export interface ExtractedMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  refRange: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'ABNORMAL' | 'NEUTRAL';
  category: 'Blood / Hematology' | 'Metabolic / Lipid' | 'Endocrine / Thyroid' | 'Renal / Hepatic' | 'Vitamins / Minerals' | 'Radiology / Scan' | 'General';
}

export interface MedicalAnalysisResult {
  summary: string;
  overallHealthStatus: 'Optimal' | 'Mild Issues Detected' | 'Attention Required';
  goods: { title: string; desc: string }[];
  bads: { title: string; desc: string; severity: 'High' | 'Moderate' | 'Mild' }[];
  neutrals: { title: string; desc: string }[];
  metrics: ExtractedMetric[];
  ayurvedicAnalysis: {
    doshaImbalance: ('Vata' | 'Pitta' | 'Kapha')[];
    affectedDhatus: string[];
    pathologyExplanation: string;
    remedies: string[];
    dietPathya: string[];
    dietApathya: string[];
  };
}

// Database of known clinical reference ranges for automatic evaluation
export const CLINICAL_DATABASE: Record<string, {
  name: string;
  refMin: number;
  refMax: number;
  unit: string;
  category: ExtractedMetric['category'];
  lowTitle: string;
  lowDesc: string;
  lowRemedies: string[];
  lowPathya: string[];
  lowApathya: string[];
  highTitle: string;
  highDesc: string;
  highRemedies: string[];
  highPathya: string[];
  highApathya: string[];
}> = {
  hemoglobin: {
    name: 'Hemoglobin (Hb)',
    refMin: 12.0,
    refMax: 16.0,
    unit: 'g/dL',
    category: 'Blood / Hematology',
    lowTitle: 'Anemia / Low Red Cell Oxygenation',
    lowDesc: 'Low hemoglobin reduces oxygen delivery to vital tissues. Corresponds to Pandu Roga in Ayurveda caused by Rakta & Rasa Dhatu depletion.',
    lowRemedies: ['Lohasava (15ml twice daily)', 'Punarnavadi Mandoor', 'Fresh Beetroot & Amla juice'],
    lowPathya: ['Pomegranates', 'Soaked raisins', 'Cooked spinach', 'Beetroot'],
    lowApathya: ['Black tea with meals', 'Excessive caffeinated drinks', 'Raw dry crackers'],
    highTitle: 'High Hemoglobin / Increased Blood Viscosity',
    highDesc: 'Elevated hemoglobin indicates thick blood or dehydration. Points to excess Pitta heat in Rakta Dhatu.',
    highRemedies: ['Manjisthadi Kwath', 'Neem capsules', 'Coriander seed water'],
    highPathya: ['Coconut water', 'Melons & Pears', 'Cucumber'],
    highApathya: ['Salty pickles', 'Deep fried foods', 'Fermented vinegar'],
  },
  glucose: {
    name: 'Fasting Blood Glucose',
    refMin: 70,
    refMax: 100,
    unit: 'mg/dL',
    category: 'Metabolic / Lipid',
    lowTitle: 'Hypoglycemia / Low Blood Sugar',
    lowDesc: 'Below 70 mg/dL causes weakness, sweating, and rapid heart rate. Involves acute Vata depletion (Ojas Kshaya).',
    lowRemedies: ['Warm milk with honey & cardamom', 'Chyawanprash (1 tbsp daily)', 'Soaked dates'],
    lowPathya: ['Cooked sweet potatoes', 'Basmati rice', 'Fresh sweet fruits'],
    lowApathya: ['Fasting without supervision', 'Bitter leaf juices in excess'],
    highTitle: 'Hyperglycemia / Pre-Diabetes Marker',
    highDesc: 'Elevated fasting glucose indicates impaired carbohydrate metabolism (Prameha) due to Kapha-Medas blockage of insulin Agni.',
    highRemedies: ['Nisha-Amalaki (Turmeric + Amla powder)', 'Gudmar (Gymnema) powder', 'Chandraprabha Vati'],
    highPathya: ['Bitter melon (Karela)', 'Fenugreek (Methi) seeds', 'Moong dal soup', 'Quinoa'],
    highApathya: ['Refined white sugar', 'Bakery products', 'Sweet mangoes & bananas', 'Daytime sleep'],
  },
  hba1c: {
    name: 'HbA1c (Glycated Hemoglobin)',
    refMin: 4.0,
    refMax: 5.6,
    unit: '%',
    category: 'Metabolic / Lipid',
    lowTitle: 'Low Glycated Sugar Average',
    lowDesc: 'Values below 4.0% are rare and indicate chronic calorie restriction or severe anemia.',
    lowRemedies: ['Nutritious warm foods', 'Ashwagandha milk'],
    lowPathya: ['Whole grains', 'Ghee'],
    lowApathya: ['Unchecked fasting'],
    highTitle: 'Elevated 3-Month Sugar Average',
    highDesc: 'HbA1c above 5.6% signals pre-diabetes or diabetes (Dhirgha Prameha). Sticky Ama toxins clog glucose metabolic channels.',
    highRemedies: ['Chandraprabha Vati (2 tabs twice daily)', 'Gudmar leaf powder', 'Vasant Kusumakar Ras'],
    highPathya: ['Barley rotis', 'Bitter vegetables', 'Amla juice'],
    highApathya: ['Soft drinks', 'Refined flour', 'Sedentary lifestyle'],
  },
  cholesterol: {
    name: 'Total Cholesterol',
    refMin: 130,
    refMax: 200,
    unit: 'mg/dL',
    category: 'Metabolic / Lipid',
    lowTitle: 'Hypocholesterolemia',
    lowDesc: 'Low lipid levels weaken cell membranes and hormone synthesis. Linked to hyperactive Vata consuming lipid stores.',
    lowRemedies: ['Ashwagandha Lehyam', 'Organic A2 Cow Ghee in meals'],
    lowPathya: ['Sesame seeds', 'Soaked almonds', 'Warm cooked grains'],
    lowApathya: ['Strict oil-free fasting'],
    highTitle: 'Hypercholesterolemia / Elevated Lipids',
    highDesc: 'Cholesterol over 200 mg/dL increases vascular risk. Caused by sluggish digestion (Agni Mandya) generating lipid Ama toxins (Medo Dushti).',
    highRemedies: ['Medohara Guggulu (2 tabs twice daily)', 'Triphala Churna at bedtime', 'Arjuna bark tea'],
    highPathya: ['Garlic in cooking', 'Barley', 'Warm ginger tea', 'Steamed veggies'],
    highApathya: ['Heavy paneer & cheese', 'Red meat', 'Ice creams', 'Sleeping after lunch'],
  },
  tsh: {
    name: 'Thyroid Stimulating Hormone (TSH)',
    refMin: 0.45,
    refMax: 4.5,
    unit: 'mIU/L',
    category: 'Endocrine / Thyroid',
    lowTitle: 'Suppressed TSH / Hyperthyroidism Profile',
    lowDesc: 'TSH under 0.45 mIU/L indicates thyroid overactivity. Caused by excess Pitta-Vata heat accelerating metabolic burnout.',
    lowRemedies: ['Shankhapushpi syrup', 'Brahmi Rasayana', 'Shatavari powder with milk'],
    lowPathya: ['Cooling milk with ghee', 'Dates', 'Oatmeal', 'Sweet ripe fruits'],
    lowApathya: ['Pungent chilli & cayenne', 'Garlic', 'Excessive hot drinks'],
    highTitle: 'Elevated TSH / Hypothyroidism Profile',
    highDesc: 'TSH over 4.5 mIU/L reflects sluggish thyroid function. Linked to Kapha-Vata blockage slowing tissue metabolism (Agni Mandya).',
    highRemedies: ['Kanchnar Guggulu (2 tabs twice daily)', 'Trikatu Churna after meals', 'Punarnava tablets'],
    highPathya: ['Cinnamon & Cardamom warm tea', 'Bitter gourds', 'Millets'],
    highApathya: ['Raw cabbage & broccoli', 'Heavy sweet creams', 'Ice water'],
  },
  wbc: {
    name: 'White Blood Cell Count (WBC)',
    refMin: 4.0,
    refMax: 11.0,
    unit: 'x10^3/µL',
    category: 'Blood / Hematology',
    lowTitle: 'Leukopenia / Low Immune Defense',
    lowDesc: 'Low WBC count leaves the body vulnerable to infections (Ojas Kshaya / low vital immunity).',
    lowRemedies: ['Giloy (Guduchi) juice daily', 'Chyawanprash (1 tbsp daily)', 'Ashwagandha tablets'],
    lowPathya: ['Almonds', 'Moong soup', 'Steamed greens', 'Raw honey'],
    lowApathya: ['Packaged canned foods', 'Stale leftovers', 'Cold drinks'],
    highTitle: 'Leukocytosis / Inflammatory State',
    highDesc: 'High WBC count indicates active infection or systemic inflammation (Rakta Pitta heat).',
    highRemedies: ['Mahasudarshan Churna', 'Neem capsules', 'Patola Katurohinyadi Kashayam'],
    highPathya: ['Pomegranates', 'Cilantro infusions', 'Cucumbers'],
    highApathya: ['Super spicy foods', 'Raw garlic', 'Vinegar pickles'],
  },
  creatinine: {
    name: 'Serum Creatinine',
    refMin: 0.6,
    refMax: 1.2,
    unit: 'mg/dL',
    category: 'Renal / Hepatic',
    lowTitle: 'Low Muscle Mass / Creatinine Depletion',
    lowDesc: 'Low creatinine indicates reduced muscle volume or protein deficiency (Mamsa Dhatu Kshaya).',
    lowRemedies: ['Ashwagandha Lehyam with milk', 'Shatavari granules'],
    lowPathya: ['Cooked pulses', 'Grains', 'Milk'],
    lowApathya: ['Severe starvation diets'],
    highTitle: 'Elevated Creatinine / Kidney Stress',
    highDesc: 'Creatinine over 1.2 mg/dL points to impaired renal filtration (Mutravaha Srotas blockage by Vata and Ama).',
    highRemedies: ['Gokshuradi Guggulu (2 tabs twice daily)', 'Punarnavarishta (15ml after meals)', 'Varuna tea'],
    highPathya: ['Boiled radish', 'Coriander seed tea', 'Barley water', 'Lauki (Bottle gourd)'],
    highApathya: ['High protein whey supplements', 'Excess table salt', 'Heavy spinach in excess'],
  },
  alt: {
    name: 'SGPT / ALT (Liver Enzyme)',
    refMin: 7,
    refMax: 56,
    unit: 'U/L',
    category: 'Renal / Hepatic',
    lowTitle: 'Normal Baseline Liver Enzyme',
    lowDesc: 'Standard baseline within normal ranges.',
    lowRemedies: ['Maintain healthy diet'],
    lowPathya: ['Balanced green diet'],
    lowApathya: ['Alcohol'],
    highTitle: 'Elevated ALT / Liver Cell Inflammation',
    highDesc: 'ALT over 56 U/L signals liver cell irritation or fatty liver (Yakrut Pitta Vitiation & Rakta Dushi).',
    highRemedies: ['Bhumi Amla powder (1/2 tsp twice daily)', 'Arogyavardhini Vati (2 tabs twice daily)', 'Kalmegh tea'],
    highPathya: ['Aloe Vera juice', 'Fresh apples', 'Bottle gourd juice', 'Fresh coriander'],
    highApathya: ['Alcoholic drinks', 'Deep fried items', 'Red chillies'],
  },
  vitaminD: {
    name: 'Vitamin D3 (25-OH)',
    refMin: 30,
    refMax: 100,
    unit: 'ng/mL',
    category: 'Vitamins / Minerals',
    lowTitle: 'Vitamin D Deficiency / Bone Weakness',
    lowDesc: 'Under 30 ng/mL leads to bone density loss (Asthi Dhatu Kshaya) and Vata joint stiffness.',
    lowRemedies: ['Lakshadi Guggulu (2 tabs twice daily)', 'Mukta Pishti (natural calcium source)', 'Gandha Thailam capsules'],
    lowPathya: ['Sesame seeds', 'Grass-fed cow milk', 'Almonds', 'Sunlight exposure (20 mins morning)'],
    lowApathya: ['Carbonated sodas', 'White sugar', 'Astringent dry snacks'],
    highTitle: 'High Vitamin D Level',
    highDesc: 'Very high levels above 100 ng/mL require stopping supplements to prevent calcium overload.',
    highRemedies: ['Drink plenty of water', 'Pause Vit D supplements'],
    highPathya: ['Watermelon', 'Mung soup'],
    highApathya: ['Fortified calcium items'],
  },
  vitaminB12: {
    name: 'Vitamin B12 (Cobalamin)',
    refMin: 200,
    refMax: 900,
    unit: 'pg/mL',
    category: 'Vitamins / Minerals',
    lowTitle: 'Vitamin B12 Deficiency / Nerve Depletion',
    lowDesc: 'Under 200 pg/mL causes nerve numbness, brain fog, and anemia (Majja Dhatu & Prana Vayu weakness).',
    lowRemedies: ['Brahmi Rasayana', 'Balarishta (15ml twice daily)', 'Hingwashtak Churna for gut Agni'],
    lowPathya: ['Organic A2 cow milk', 'Fresh spiced buttermilk (Takra)', 'Sprouted grains'],
    lowApathya: ['Cold packaged meals', 'Iced sodas', 'Dry toast'],
    highTitle: 'High Vitamin B12',
    highDesc: 'High serum B12 is typically benign from supplements.',
    highRemedies: ['Pause high-dose supplements', 'Drink warm CCF tea'],
    highPathya: ['Warm light soups'],
    highApathya: ['Energy drinks'],
  },
  platelets: {
    name: 'Platelet Count',
    refMin: 150,
    refMax: 450,
    unit: 'x10^3/µL',
    category: 'Blood / Hematology',
    lowTitle: 'Thrombocytopenia / Low Platelet Count',
    lowDesc: 'Under 150k/uL increases bleeding risk. Linked to Rakta Kshaya and Pitta blood vulnerability.',
    lowRemedies: ['Papaya leaf juice extract', 'Giloy Ghanvati (2 tabs twice daily)', 'Wheatgrass juice'],
    lowPathya: ['Pomegranate juice', 'Steamed green vegetables', 'Moong soup'],
    lowApathya: ['Alcohol', 'Heavy sour pickles', 'Stale food'],
    highTitle: 'Thrombocytosis / High Platelet Count',
    highDesc: 'Platelets above 450k/uL point to blood channel sluggishness and systemic inflammation.',
    highRemedies: ['Neem capsules', 'Giloy extract'],
    highPathya: ['Barley water', 'Coriander seed infusion'],
    highApathya: ['Fried heavy food', 'Curd at night'],
  },
  rbc: {
    name: 'Red Blood Cell Count (RBC)',
    refMin: 4.5,
    refMax: 5.9,
    unit: 'm/µL',
    category: 'Blood / Hematology',
    lowTitle: 'Low Red Blood Cells',
    lowDesc: 'Low RBCs indicate Rakta Dhatu depletion and lower oxygen capacity.',
    lowRemedies: ['Lohasava', 'Amla powder with honey', 'Chyawanprash'],
    lowPathya: ['Pomegranates', 'Red apples', 'Soaked dates'],
    lowApathya: ['Dry crackers', 'Excessive fasting'],
    highTitle: 'High Red Blood Cells',
    highDesc: 'Elevated RBCs point to blood thickening or Pitta heat.',
    highRemedies: ['Manjisthadi Kwath', 'Coriander water'],
    highPathya: ['Coconut water', 'Cucumber'],
    highApathya: ['Vinegar', 'Spicy chillies'],
  }
};

// Advanced Regex Engine to parse ANY medical text (Lab or Radiology Scan)
export function parseMedicalText(text: string): { metrics: ExtractedMetric[]; textFindings: string[] } {
  const metrics: ExtractedMetric[] = [];
  const textFindings: string[] = [];

  if (!text || text.trim().length === 0) {
    return { metrics, textFindings };
  }

  const lines = text.split(/\r?\n/);

  // 1. Check for Radiology / Scan findings keywords
  const scanKeywords = [
    { pattern: /normal lung|clear lung|no consolidation|no pneumothorax/i, status: 'NORMAL', label: 'Lungs & Pleura: Clear & Normal' },
    { pattern: /opacity|consolidation|infiltrate|pneumonia/i, status: 'ABNORMAL', label: 'Lung Opacity / Infiltrate Noted' },
    { pattern: /cardiomegaly|enlarged heart/i, status: 'ABNORMAL', label: 'Cardiomegaly / Mild Heart Enlargement' },
    { pattern: /fracture|dislocation|bone defect/i, status: 'ABNORMAL', label: 'Skeletal Fracture or Dislocation' },
    { pattern: /disc bulge|protrusion|herniation|spondylosis|stenosis|degeneration/i, status: 'ABNORMAL', label: 'Spinal Disc Bulge / Spondylotic Change' },
    { pattern: /normal brain|no acute infarct|no hemorrhage|ventricles normal/i, status: 'NORMAL', label: 'Brain Parenchyma: Normal & Clear' },
    { pattern: /effusion|fluid accumulation/i, status: 'ABNORMAL', label: 'Pleural or Joint Effusion' },
  ];

  scanKeywords.forEach(sk => {
    if (sk.pattern.test(text)) {
      textFindings.push(`${sk.label}`);
    }
  });

  // 2. Check Database Matchers for numerical biomarkers
  const dbKeys = Object.keys(CLINICAL_DATABASE);
  
  dbKeys.forEach(key => {
    const spec = CLINICAL_DATABASE[key];
    // Build regex dynamically
    let pattern = new RegExp(`(?:${key}|${spec.name.split(' ')[0]})\\s*[:=-]?\\s*(\\d+(?:\\.\\d+)?)\\s*([a-zA-Z%^\\/0-9]*)\\s*(?:\\(([^)]+)\\))?`, 'i');
    
    // Custom patterns for specific keys
    if (key === 'hemoglobin') pattern = /(?:hemoglobin|haemoglobin|hb|hgb)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i;
    if (key === 'glucose') pattern = /(?:glucose|fasting glucose|fbs|blood sugar|sugar)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i;
    if (key === 'hba1c') pattern = /(?:hba1c|glycated hemoglobin)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i;
    if (key === 'cholesterol') pattern = /(?:total cholesterol|cholesterol|tc)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i;
    if (key === 'tsh') pattern = /(?:tsh|thyroid stimulating|thyroid)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i;
    if (key === 'wbc') pattern = /(?:wbc|white blood cells|leukocytes)\s*(?:count)?\s*[:=-]?\s*(\d+(?:,\d+)?(?:\.\d+)?)/i;
    if (key === 'creatinine') pattern = /(?:creatinine|creat)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i;
    if (key === 'alt') pattern = /(?:alt|sgpt|alanine)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i;
    if (key === 'vitaminD') pattern = /(?:vitamin d|vit d|25-oh vit d)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i;
    if (key === 'vitaminB12') pattern = /(?:vitamin b12|vit b12|b12)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i;
    if (key === 'rbc') pattern = /(?:rbc|red blood cells)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i;
    if (key === 'platelets') pattern = /(?:platelet|platelets|plt)\s*(?:count)?\s*[:=-]?\s*(\d+(?:,\d+)?(?:\.\d+)?)/i;

    const match = text.match(pattern);
    if (match && match[1]) {
      let rawVal = match[1].replace(/,/g, '');
      let numVal = parseFloat(rawVal);
      if (!isNaN(numVal)) {
        // Normalization
        if (key === 'wbc' && numVal > 250) numVal = numVal / 1000;
        if (key === 'platelets' && numVal > 1000) numVal = numVal / 1000;

        let status: ExtractedMetric['status'] = 'NORMAL';
        if (numVal < spec.refMin) status = 'LOW';
        else if (numVal > spec.refMax) status = 'HIGH';

        metrics.push({
          id: `metric-${key}-${Date.now()}`,
          name: spec.name,
          value: numVal.toString(),
          unit: spec.unit,
          refRange: `${spec.refMin} - ${spec.refMax}`,
          status,
          category: spec.category,
        });
      }
    }
  });

  // 3. Fallback generic line parser for custom laboratory lines: "Test Name  Result  Unit  Reference"
  lines.forEach((line, idx) => {
    // e.g. "Urea 28.5 mg/dL 15.0-45.0" or "Serum Iron 85 ug/dL 60-170"
    const genericMatch = line.match(/^([A-Za-z0-9\s()./-]{3,35})\s+([0-9.]+)\s+([a-zA-Z%/^0-9]+)?\s*\(?([0-9.-]+)?\)?$/);
    if (genericMatch) {
      const name = genericMatch[1].trim();
      const valStr = genericMatch[2];
      const unit = genericMatch[3] || '';
      const range = genericMatch[4] || 'Standard';

      // Avoid duplicate matching if already matched in db
      const alreadyMatched = metrics.some(m => m.name.toLowerCase().includes(name.toLowerCase()));
      if (!alreadyMatched && name.length > 2 && !/total|date|page|name|patient|age|gender|doctor|lab/i.test(name)) {
        let status: ExtractedMetric['status'] = 'NORMAL';
        if (range.includes('-')) {
          const [rMin, rMax] = range.split('-').map(x => parseFloat(x));
          const num = parseFloat(valStr);
          if (!isNaN(rMin) && !isNaN(rMax) && !isNaN(num)) {
            if (num < rMin) status = 'LOW';
            else if (num > rMax) status = 'HIGH';
          }
        }
        metrics.push({
          id: `custom-metric-${idx}-${Date.now()}`,
          name: name,
          value: valStr,
          unit: unit,
          refRange: range,
          status: status,
          category: 'General',
        });
      }
    }
  });

  return { metrics, textFindings };
}
