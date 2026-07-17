export interface Recipe {
  id: string;
  name: string;
  sanskrit: string;
  calories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dosha: ('Vata' | 'Pitta' | 'Kapha')[];
  allergens: string[];
  ingredients: string[];
  instructions: string[];
  benefits: string;
}

export const SIGNATURE_RECIPES: Recipe[] = [
  {
    id: 'sig-1',
    name: 'Classic Ayurvedic Kitchari',
    sanskrit: 'खिचड़ी (Healing Stew)',
    calories: 450,
    mealType: 'lunch',
    dosha: ['Vata', 'Pitta', 'Kapha'],
    allergens: ['dairy'], // contains ghee
    ingredients: [
      '1/2 cup Split Yellow Mung Dal',
      '1/2 cup White Basmati Rice',
      '1 tbsp Ghee',
      '1/2 tsp Cumin seeds',
      '1/2 tsp Mustard seeds',
      '1/2 tsp Turmeric powder',
      '1 pinch Hing (asafoetida)',
      '1 tsp fresh grated Ginger',
      '4 cups Water',
      'Fresh coriander leaves',
    ],
    instructions: [
      'Heat ghee in a pot. Toast cumin and mustard seeds until they pop.',
      'Add ginger, turmeric, and hing. Sauté for 10 seconds.',
      'Add washed rice and dal, coating with ghee for 1 minute.',
      'Add water. Bring to boil, then simmer covered on low for 25 minutes until soft.',
      'Serve warm garnish with fresh coriander.',
    ],
    benefits: 'The gold standard Ayurvedic detox food. Highly digestible and soothing for all doshas.',
  },
  {
    id: 'sig-2',
    name: 'Golden Turmeric Elixir',
    sanskrit: 'हरिद्रा दुग्ध (Immunity Milk)',
    calories: 180,
    mealType: 'snack',
    dosha: ['Vata', 'Pitta'],
    allergens: ['dairy'],
    ingredients: [
      '1 cup Milk (or Almond milk)',
      '1/2 tsp Turmeric powder',
      '1/4 tsp Ground Cardamom',
      '1/4 tsp Ground Cinnamon',
      '1 pinch Black pepper',
      '1/2 tsp Ghee',
      '1 tsp Raw Honey (after milk cools to warm)',
    ],
    instructions: [
      'Heat milk in a saucepan over medium heat until steaming.',
      'Whisk in turmeric, cardamom, cinnamon, black pepper, and ghee.',
      'Simmer on low for 5 minutes, then remove from heat.',
      'Let cool to warm, then stir in raw honey and drink immediately.',
    ],
    benefits: 'Combats systemic inflammation, builds immunity, and assists restful sleep.',
  },
  {
    id: 'sig-3',
    name: 'Digestive CCF Tea',
    sanskrit: 'CCF कषाय (Digestive Brew)',
    calories: 10,
    mealType: 'snack',
    dosha: ['Vata', 'Pitta', 'Kapha'],
    allergens: [],
    ingredients: [
      '1/2 tsp Whole Cumin seeds',
      '1/2 tsp Whole Coriander seeds',
      '1/2 tsp Whole Fennel seeds',
      '3 cups Water',
    ],
    instructions: [
      'Add cumin, coriander, and fennel seeds to water in a pot.',
      'Bring to a rolling boil over high heat.',
      'Lower heat and simmer uncovered for 8 minutes.',
      'Strain into mugs and sip warm throughout the day.',
    ],
    benefits: 'Balances Agni (digestive fire), reduces flatulence, and cleanses water retention.',
  },
  {
    id: 'sig-4',
    name: 'Spiced Stewed Apples',
    sanskrit: 'सुपक्व सेब (Morning Grounder)',
    calories: 190,
    mealType: 'breakfast',
    dosha: ['Vata', 'Kapha'],
    allergens: [],
    ingredients: [
      '1 organic Apple (peeled and chopped)',
      '1/3 cup Water',
      '2 whole Cloves',
      '1/4 tsp Cinnamon powder',
      '1/4 tsp Cardamom powder',
      '5 raisins',
    ],
    instructions: [
      'Combine chopped apples, water, cloves, cinnamon, cardamom, and raisins in a saucepan.',
      'Bring to boil, then cover and simmer on low for 12 minutes until tender.',
      'Remove cloves and serve warm.',
    ],
    benefits: 'Warming and grounding. Excellent for Vata nervous systems and Kapha sluggishness.',
  },
  {
    id: 'sig-5',
    name: 'Ayurvedic Oatmeal Porridge',
    sanskrit: 'दलिया (Warm Oatmeal)',
    calories: 320,
    mealType: 'breakfast',
    dosha: ['Vata', 'Pitta'],
    allergens: ['gluten'],
    ingredients: [
      '1/2 cup Rolled Oats',
      '1 cup Almond milk',
      '1 tbsp Maple syrup',
      '1 pinch Cinnamon',
      '1 pinch Nutmeg',
      '5-6 Almonds (sliced)',
    ],
    instructions: [
      'Combine oats, almond milk, cinnamon, and nutmeg in a saucepan.',
      'Bring to boil, then simmer on low for 8-10 minutes, stirring frequently.',
      'Stir in maple syrup and top with sliced almonds.',
    ],
    benefits: 'Nourishing, heavy, and warming. Perfect morning fuel to pacify Vata dryness.',
  },
];

// Combinatoric lists
const GRAINS = [
  { name: 'Basmati Rice', calories: 200, allergens: [], dosha: ['Vata', 'Pitta', 'Kapha'] },
  { name: 'Quinoa', calories: 180, allergens: [], dosha: ['Vata', 'Pitta'] },
  { name: 'Millet', calories: 170, allergens: [], dosha: ['Kapha'] },
  { name: 'Barley', calories: 160, allergens: [], dosha: ['Pitta', 'Kapha'] },
  { name: 'Amaranth', calories: 190, allergens: [], dosha: ['Vata', 'Pitta', 'Kapha'] },
  { name: 'Semolina', calories: 185, allergens: ['gluten'], dosha: ['Vata', 'Pitta'] },
  { name: 'Brown Rice', calories: 215, allergens: [], dosha: ['Vata', 'Kapha'] },
  { name: 'Buckwheat', calories: 165, allergens: [], dosha: ['Kapha'] },
  { name: 'Spelt', calories: 195, allergens: ['gluten'], dosha: ['Vata', 'Pitta'] },
  { name: 'Oats', calories: 150, allergens: ['gluten'], dosha: ['Vata', 'Pitta'] },
];

const PROTEINS = [
  { name: 'Yellow Mung Dal', calories: 120, allergens: [], dosha: ['Vata', 'Pitta', 'Kapha'] },
  { name: 'Split Red Lentils', calories: 110, allergens: [], dosha: ['Pitta', 'Kapha'] },
  { name: 'Whole Green Mung', calories: 115, allergens: [], dosha: ['Vata', 'Pitta', 'Kapha'] },
  { name: 'Chickpeas', calories: 130, allergens: [], dosha: ['Kapha'] },
  { name: 'Toor Dal', calories: 125, allergens: [], dosha: ['Pitta', 'Kapha'] },
  { name: 'Paneer (Cottage Cheese)', calories: 160, allergens: ['dairy'], dosha: ['Vata', 'Pitta'] },
  { name: 'Tofu (Organic)', calories: 90, allergens: ['soy'], dosha: ['Pitta', 'Kapha'] },
  { name: 'Green Peas', calories: 75, allergens: [], dosha: ['Pitta', 'Kapha'] },
  { name: 'Urad Dal', calories: 140, allergens: [], dosha: ['Vata'] },
  { name: 'Black Eyed Peas', calories: 110, allergens: [], dosha: ['Kapha'] },
];

const VEGGIES = [
  { name: 'Zucchini & Spinach', calories: 30, allergens: [], dosha: ['Pitta', 'Vata'] },
  { name: 'Sweet Potato & Carrot', calories: 75, allergens: [], dosha: ['Vata', 'Pitta'] },
  { name: 'Cabbage & Peas', calories: 40, allergens: [], dosha: ['Kapha'] },
  { name: 'Cauliflower & Potato', calories: 50, allergens: [], dosha: ['Kapha'] },
  { name: 'Pumpkin & Fennel', calories: 45, allergens: [], dosha: ['Vata', 'Pitta'] },
  { name: 'Beetroot & Asparagus', calories: 60, allergens: [], dosha: ['Vata', 'Pitta'] },
  { name: 'Kale & Celery', calories: 25, allergens: [], dosha: ['Kapha'] },
  { name: 'Radish & Ginger', calories: 35, allergens: [], dosha: ['Kapha', 'Vata'] },
  { name: 'Broccoli & Leek', calories: 40, allergens: [], dosha: ['Kapha'] },
  { name: 'Okra & Coriander', calories: 45, allergens: [], dosha: ['Pitta', 'Vata'] },
];

const SPICE_PROFILES = [
  { name: 'Vata-Grounding (Warming & Sweet)', desc: 'Heavy, warming spices to calm internal dryness.', spices: ['cardamom', 'cinnamon', 'ginger', 'clove'], dosha: ['Vata'] },
  { name: 'Pitta-Cooling (Soothing & Mild)', desc: 'Mild, sweet, and cooling spices to calm digestive fire.', spices: ['coriander', 'fennel', 'mint', 'cardamom'], dosha: ['Pitta'] },
  { name: 'Kapha-Stimulating (Spicy & Hot)', desc: 'Hot, dry spices to activate sluggish digestion.', spices: ['black pepper', 'mustard seed', 'ginger', 'cayenne'], dosha: ['Kapha'] },
  { name: 'Tridoshic-Balancing (Harmonious)', desc: 'Perfect blend of neutral spices appropriate for daily cooking.', spices: ['cumin', 'turmeric', 'ginger', 'coriander'], dosha: ['Vata', 'Pitta', 'Kapha'] },
  { name: 'Agni-Igniting (Digestive Booster)', desc: 'Spices targeted specifically to boost slow metabolic fires.', spices: ['cumin', 'black pepper', 'hing', 'ginger'], dosha: ['Vata', 'Kapha'] },
];

export function generateAllRecipes(): Recipe[] {
  const list = [...SIGNATURE_RECIPES];

  let count = 1;
  // Generate 200 combinatoric recipes
  for (let g = 0; g < GRAINS.length; g++) {
    for (let p = 0; p < PROTEINS.length; p++) {
      for (let v = 0; v < VEGGIES.length; v++) {
        for (let s = 0; s < SPICE_PROFILES.length; s++) {
          if (list.length >= 220) {
            break;
          }

          const grain = GRAINS[g];
          const protein = PROTEINS[p];
          const veggie = VEGGIES[v];
          const spice = SPICE_PROFILES[s];

          // Determine meal type based on index
          const mealType = count % 4 === 0 ? 'breakfast' : count % 4 === 1 ? 'lunch' : count % 4 === 2 ? 'dinner' : 'snack';
          
          // Calculate calories
          const baseCals = grain.calories + protein.calories + veggie.calories;
          const garnishCals = mealType === 'snack' ? 50 : 100; // less fat/ghee in snack
          const calories = baseCals + garnishCals;

          // Determine balancing doshas (intersection)
          const intersection = grain.dosha.filter(
            (d) => protein.dosha.includes(d) || veggie.dosha.includes(d) || spice.dosha.includes(d)
          ) as ('Vata' | 'Pitta' | 'Kapha')[];
          
          const dosha = intersection.length > 0 ? intersection : (['Vata', 'Pitta', 'Kapha'] as const).filter(
            (d) => grain.dosha.includes(d) || protein.dosha.includes(d)
          );

          // Merge allergens
          const allergens = Array.from(new Set([...grain.allergens, ...protein.allergens, ...veggie.allergens]));
          if (mealType !== 'snack') {
            allergens.push('dairy'); // default added ghee for hot main meals
          }

          const id = `gen-${count}`;
          const name = `Ayurvedic ${grain.name} & ${protein.name} Bowl with ${veggie.name}`;
          const sanskrit = `प्राण आहार (Prana Bowl #${count})`;
          const benefits = `Highly nurturing one-pot meal. Combining ${grain.name} with ${protein.name} provides complete amino acids. Ideal to maintain muscle mass and balance the ${dosha.join(', ')} constitution.`;

          const ingredients = [
            `1/2 cup ${grain.name}`,
            `1/3 cup ${protein.name}`,
            `1 cup chopped ${veggie.name}`,
            `1 tbsp Ghee or Sesame oil`,
            `1/2 tsp ${spice.spices[0]}`,
            `1/2 tsp ${spice.spices[1]}`,
            `1 pinch ${spice.spices[2] || 'salt'}`,
            `3.5 cups Water`,
          ];

          const instructions = [
            `Heat ghee or oil in your pan. Sauté the spices (${spice.spices.join(', ')}) on medium-low for 15 seconds to activate the volatile oils.`,
            `Add the washed ${grain.name} and ${protein.name}, stir-frying gently to toast the grains.`,
            `Add the chopped ${veggie.name} and water. Bring to a boil.`,
            `Reduce heat to low, cover, and let simmer for 20-25 minutes until the water is completely absorbed.`,
            `Let it rest for 5 minutes. Serve warm to support healthy digestion.`,
          ];

          list.push({
            id,
            name,
            sanskrit,
            calories,
            mealType,
            dosha,
            allergens,
            ingredients,
            instructions,
            benefits,
          });

          count++;
        }
      }
    }
  }

  return list;
}

export const RECIPES_DB = generateAllRecipes();
