export interface Asana {
  id: string;
  name: string;
  sanskrit: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  type: string;
  desc: string;
  balancing: ('Vata' | 'Pitta' | 'Kapha')[];
  steps: string[];
  benefits: string[];
  breathing: string;
}

export const BASE_ASANAS = [
  { name: 'Mountain Pose', sanskrit: 'ताड़ासन (Tadasana)', type: 'Standing / Alignment', dosha: ['Vata', 'Pitta', 'Kapha'], desc: 'The foundation of all standing postures. Promotes balance, centers grounding gravity, and aligns skeletal structure.' },
  { name: 'Downward Dog', sanskrit: 'अधोमुखश्वानासन (Adho Mukha Svanasana)', type: 'Inversion / Stretch', dosha: ['Vata', 'Pitta', 'Kapha'], desc: 'A rejuvenating inversion that stretches the entire back line of the body and improves blood flow to the head.' },
  { name: 'Warrior I', sanskrit: 'वीरभद्रासन १ (Virabhadrasana I)', type: 'Standing Strength', dosha: ['Kapha', 'Vata'], desc: 'Builds focus, stamina, and muscular strength, activating sluggish Kapha and grounding scattered Vata.' },
  { name: 'Triangle Pose', sanskrit: 'त्रिकोणासन (Trikonasana)', type: 'Standing Side Bend', dosha: ['Pitta', 'Vata'], desc: 'Stretches the waist, opens the ribcage, and improves deep breathing. Extremely balancing for Pitta intensity.' },
  { name: 'Tree Pose', sanskrit: 'वृक्षासन (Vrikshasana)', type: 'Balance / Grounding', dosha: ['Vata'], desc: 'Enhances cognitive focus, settles nervous anxiety, and establishes Vata roots in the earth.' },
  { name: 'Bridge Pose', sanskrit: 'सेतुबंधासन (Setu Bandhasana)', type: 'Backbend / Opening', dosha: ['Pitta', 'Kapha'], desc: 'Opens the chest, relieves stress in the neck, and stimulates the thyroid and digestive fire.' },
  { name: 'Cobra Pose', sanskrit: 'भुजंगासन (Bhujangasana)', type: 'Backbend', dosha: ['Kapha'], desc: 'An active backbend that opens the chest, stimulates gastric fire, and counters Kapha stagnation.' },
  { name: 'Child Pose', sanskrit: 'बालासन (Balasana)', type: 'Restorative / Grounding', dosha: ['Vata'], desc: 'A deeply calming posture that pulls focus inward. Restores nervous equilibrium.' },
  { name: 'Seated Forward Fold', sanskrit: 'पश्चिमौत्तानासन (Paschimottanasana)', type: 'Seated Forward Bend', dosha: ['Pitta', 'Vata'], desc: 'Calms the mind, stretches the hamstrings, and cooling for Pitta anger and digestion.' },
  { name: 'Plank Pose', sanskrit: 'फलकासन (Phalakasana)', type: 'Core Strength', dosha: ['Kapha'], desc: 'Strengthens the core, arms, and wrists. Excellent to build endurance and stimulate lazy Kapha.' },
  { name: 'Locust Pose', sanskrit: 'शलभासन (Salabhasana)', type: 'Backbend / Strength', dosha: ['Vata', 'Kapha'], desc: 'Strengthens the lower back, glutes, and thighs. Ignites metabolic fire.' },
  { name: 'Bound Angle Pose', sanskrit: 'बद्धकोणासन (Baddha Konasana)', type: 'Hip Opener', dosha: ['Vata', 'Pitta'], desc: 'Stretches the groin and inner thighs. Stimulates pelvic blood flow and calms Vata.' },
  { name: 'Half Fish Pose', sanskrit: 'अर्धमत्स्येन्द्रासन (Ardha Matsyendrasana)', type: 'Spinal Twist', dosha: ['Pitta', 'Kapha', 'Vata'], desc: 'Massages internal abdominal organs, aids digestion, and keeps the spine supple.' },
  { name: 'Corpse Pose', sanskrit: 'शवासन (Savasana)', type: 'Restorative', dosha: ['Vata', 'Pitta', 'Kapha'], desc: 'The ultimate posture of physical surrender. Calms the heart rate and integrates practice.' },
  { name: 'Easy Pose', sanskrit: 'सुखासन (Sukhasana)', type: 'Meditation Seat', dosha: ['Vata', 'Pitta', 'Kapha'], desc: 'Comfortable cross-legged sitting posture. Establishes grounding posture for meditation.' },
  { name: 'Cat-Cow Flow', sanskrit: 'मार्जर्यासन-बितीलासन (Marjaryasana-Bitilasana)', type: 'Spinal Warmup', dosha: ['Vata', 'Kapha'], desc: 'Warms up the spine, coordinates movement with breath, and clears thoracic congestion.' },
  { name: 'Camel Pose', sanskrit: 'उष्ट्रासन (Ustrasana)', type: 'Deep Backbend', dosha: ['Kapha'], desc: 'Deep heart-opener that clears lungs, boosts energy, and stimulates thyroid activity.' },
  { name: 'Standing Forward Fold', sanskrit: 'उत्तानासन (Uttanasana)', type: 'Standing Fold', dosha: ['Pitta', 'Vata'], desc: 'Cooling inversion. Relieves headache, calms nerves, and brings cooling blood to the brain.' },
];

const VARIATIONS = [
  {
    suffix: '(Classical)',
    typePrefix: 'Classical',
    level: 'Beginner' as const,
    desc: 'The traditional standard alignment of the posture.',
    step: 'Enter carefully, align joints correctly, and hold the pose statically.',
    breath: 'Inhale to prepare, exhale to settle into the classical alignment.',
  },
  {
    suffix: '(Flow Variation)',
    typePrefix: 'Dynamic Vinyasa',
    level: 'Intermediate' as const,
    desc: 'A dynamic flow modification linking movement with rhythmic breathing.',
    step: 'Transition fluidly in and out of the posture matching the breath count.',
    breath: 'Coordinate inhale with spinal extension, exhale with flexion/folding.',
  },
  {
    suffix: '(Block-Supported Vetting)',
    typePrefix: 'Therapeutic Prop',
    level: 'Beginner' as const,
    desc: 'Modified using yoga blocks to reduce strain and ensure safety.',
    step: 'Place a cork or foam block under your hands/sit-bones to bring the floor closer.',
    breath: 'Focus on breathing slowly without straining, letting the blocks take the weight.',
  },
  {
    suffix: '(Wall-Assisted Restorative)',
    typePrefix: 'Supported Veda',
    level: 'Beginner' as const,
    desc: 'Modified using the wall for grounding feedback and stability.',
    step: 'Align your back, heels, or hands against the wall to assist balance.',
    breath: 'Breathe deeply into the back ribs, letting the wall support your posture.',
  },
  {
    suffix: '(Advanced Bind)',
    typePrefix: 'Advanced Ashtanga',
    level: 'Advanced' as const,
    desc: 'An advanced variation including binds to deepen the shoulder or hip stretch.',
    step: 'Wrap your arms around your leg/torso, clasping hands to bind and twist deeper.',
    breath: 'Maintain slow, steady, deep thoracic breathing despite the locked bind.',
  },
  {
    suffix: '(Pranayama-Synced)',
    typePrefix: 'Mudra Restorative',
    level: 'Intermediate' as const,
    desc: 'Restorative variation focusing on breath retention and energy locks (bandhas).',
    step: 'Settle into a comfortable hold and introduce conscious breathing cues.',
    breath: 'Engage slow 4s inhale, 4s hold, 4s exhale pattern during the posture.',
  },
];

export function generateAllAsanas(): Asana[] {
  const list: Asana[] = [];

  let count = 1;
  for (let b = 0; b < BASE_ASANAS.length; b++) {
    for (let v = 0; v < VARIATIONS.length; v++) {
      const base = BASE_ASANAS[b];
      const variation = VARIATIONS[v];

      const id = `asana-${count}`;
      const name = `${base.name} ${variation.suffix}`;
      const sanskrit = `${base.sanskrit.split(' ')[0]} - ${variation.typePrefix}`;
      
      const steps = [
        `Prepare: Breathe slowly, clear your mind, and align your feet.`,
        ...base.name === 'Downward Dog'
          ? [`Start on all fours. Press hands flat, tuck toes, and lift hips high.`]
          : [`Stand or sit tall. Adjust core stability and relax shoulders.`],
        variation.step,
        `Hold the posture for 5 deep cycles of breath, keeping the spine long.`,
        `Gently release on an exhale and rest in neutral alignment.`,
      ];

      const benefits = [
        `Balances the ${base.dosha.join('-')} energies in the body.`,
        `Strengthens local joints and muscles corresponding to ${base.type}.`,
        `Increases internal prana flow and relieves physical stagnation.`,
      ];

      list.push({
        id,
        name,
        sanskrit,
        level: variation.level,
        type: `${variation.typePrefix} ${base.type}`,
        desc: `${variation.desc} ${base.desc}`,
        balancing: base.dosha as ('Vata' | 'Pitta' | 'Kapha')[],
        steps,
        benefits,
        breathing: variation.breath,
      });

      count++;
    }
  }

  return list;
}

export const YOGA_DB = generateAllAsanas();
