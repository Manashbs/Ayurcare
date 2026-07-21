'use client';

import React, { useState, useEffect } from 'react';
import { Utensils, AlertTriangle, CheckCircle, ArrowRight, Clock, User, HelpCircle, Heart, Plus, Sparkles, RefreshCw, X, Apple, Search } from 'lucide-react';
import { RECIPES_DB, Recipe } from '@/lib/recipes';

interface PlanState {
  goal: string;
  currentWeight: number;
  weightChange: number;
  durationDays: number;
  targetCalories: number;
  allergies: string[];
  exclusions: string[];
  dayMeals: Record<number, Record<string, Recipe>>; // day -> mealType -> Recipe
}

export default function AyurvedicDiet() {
  const [activeTab, setActiveTab] = useState<'planner' | 'recipes' | 'guidelines'>('planner');
  
  // Wizard States
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('Weight Loss');
  const [currentWeight, setCurrentWeight] = useState(70);
  const [weightChange, setWeightChange] = useState(5);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [exclusionsInput, setExclusionsInput] = useState('');
  const [targetCalories, setTargetCalories] = useState(1500);

  // Generated Plan State
  const [plan, setPlan] = useState<PlanState | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load plan from localStorage if present
  useEffect(() => {
    const saved = localStorage.getItem('ayurcare_meal_plan');
    if (saved) {
      try {
        setPlan(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Compute Safe Duration & Calories dynamically based on weights
  useEffect(() => {
    if (goal === 'Weight Loss') {
      // Safe rate of weight loss is 0.5kg per week (0.07kg per day)
      // So days required = weightChange / 0.07 (roughly 14 days per kg)
      const days = Math.max(14, Math.round(weightChange * 14));
      
      // Calculate target calories: maintenance estimate minus 500 kcal deficit
      const maintenance = Math.round(currentWeight * 30);
      const target = Math.max(1200, Math.min(2200, maintenance - 500));
      
      setTargetCalories(target);
    } else if (goal === 'Weight Gain') {
      const days = Math.max(14, Math.round(weightChange * 14));
      const maintenance = Math.round(currentWeight * 30);
      const target = Math.min(3000, maintenance + 400);
      setTargetCalories(target);
    } else {
      // General Health Goals
      setTargetCalories(1800);
    }
  }, [goal, currentWeight, weightChange]);

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  // Generate Daily Food Charts
  const handleGeneratePlan = () => {
    const exclusions = exclusionsInput
      .split(',')
      .map((x) => x.trim().toLowerCase())
      .filter((x) => x.length > 0);

    const calculatedDuration = goal.includes('Weight') ? Math.max(14, Math.round(weightChange * 14)) : 30;

    // Build dayMeals record mapping day 1..N to breakfast, lunch, dinner, snack
    const dayMeals: Record<number, Record<string, Recipe>> = {};

    // Filter recipes that do not violate user allergies or exclusions
    const safeRecipes = RECIPES_DB.filter((r) => {
      // Check allergies
      const hasAllergen = r.allergens.some((a) => allergies.includes(a.toLowerCase()));
      // Check custom exclusions
      const hasExcluded = exclusions.some(
        (ex) =>
          r.name.toLowerCase().includes(ex) ||
          r.ingredients.some((ing) => ing.toLowerCase().includes(ex))
      );
      return !hasAllergen && !hasExcluded;
    });

    if (safeRecipes.length === 0) {
      alert('No recipes found matching your dietary constraints. Please remove some allergies or exclusions.');
      return;
    }

    // Split safe recipes by meal type
    const breakfastList = safeRecipes.filter((r) => r.mealType === 'breakfast');
    const lunchList = safeRecipes.filter((r) => r.mealType === 'lunch');
    const dinnerList = safeRecipes.filter((r) => r.mealType === 'dinner');
    const snackList = safeRecipes.filter((r) => r.mealType === 'snack');

    // Fallbacks if lists are empty
    const bfPool = breakfastList.length > 0 ? breakfastList : RECIPES_DB.filter((r) => r.mealType === 'breakfast');
    const lnPool = lunchList.length > 0 ? lunchList : RECIPES_DB.filter((r) => r.mealType === 'lunch');
    const dnPool = dinnerList.length > 0 ? dinnerList : RECIPES_DB.filter((r) => r.mealType === 'dinner');
    const snPool = snackList.length > 0 ? snackList : RECIPES_DB.filter((r) => r.mealType === 'snack');

    // Distribute calories approximately: Breakfast 25%, Lunch 35%, Snack 15%, Dinner 25%
    const targetBf = targetCalories * 0.25;
    const targetLn = targetCalories * 0.35;
    const targetSn = targetCalories * 0.15;
    const targetDn = targetCalories * 0.25;

    // Helper to find closest recipe to target calories
    const findClosest = (pool: Recipe[], targetCals: number, indexOffset: number) => {
      // Sort by absolute distance to target calories
      const sorted = [...pool].sort(
        (a, b) => Math.abs(a.calories - targetCals) - Math.abs(b.calories - targetCals)
      );
      // Pick dynamically using indexOffset to vary meals day-to-day
      const pickIdx = indexOffset % Math.min(5, sorted.length);
      return sorted[pickIdx] || sorted[0];
    };

    for (let day = 1; day <= calculatedDuration; day++) {
      dayMeals[day] = {
        breakfast: findClosest(bfPool, targetBf, day),
        lunch: findClosest(lnPool, targetLn, day + 1),
        snack: findClosest(snPool, targetSn, day + 2),
        dinner: findClosest(dnPool, targetDn, day + 3),
      };
    }

    const generatedPlan: PlanState = {
      goal,
      currentWeight,
      weightChange,
      durationDays: calculatedDuration,
      targetCalories,
      allergies,
      exclusions,
      dayMeals,
    };

    setPlan(generatedPlan);
    localStorage.setItem('ayurcare_meal_plan', JSON.stringify(generatedPlan));
    setSelectedDay(1);
    setStep(1); // Reset wizard state
  };

  // Swap specific meal on the active day
  const handleSwapMeal = (mealType: string) => {
    if (!plan) return;

    const currentMeal = plan.dayMeals[selectedDay][mealType];
    const targetCals = currentMeal.calories;

    // Exclude current meal and filter safe ones of the same type
    const safeRecipes = RECIPES_DB.filter((r) => {
      if (r.mealType !== mealType || r.id === currentMeal.id) return false;
      const hasAllergen = r.allergens.some((a) => plan.allergies.includes(a.toLowerCase()));
      const hasExcluded = plan.exclusions.some(
        (ex) =>
          r.name.toLowerCase().includes(ex) ||
          r.ingredients.some((ing) => ing.toLowerCase().includes(ex))
      );
      return !hasAllergen && !hasExcluded;
    });

    if (safeRecipes.length === 0) {
      alert('No alternative recipes found with your dietary rules.');
      return;
    }

    // Sort by calorie closeness
    const sorted = [...safeRecipes].sort(
      (a, b) => Math.abs(a.calories - targetCals) - Math.abs(b.calories - targetCals)
    );

    // Pick the closest calorie-matched alternative
    const newMeal = sorted[0];

    const updatedDayMeals = { ...plan.dayMeals };
    updatedDayMeals[selectedDay] = {
      ...updatedDayMeals[selectedDay],
      [mealType]: newMeal,
    };

    const updatedPlan = { ...plan, dayMeals: updatedDayMeals };
    setPlan(updatedPlan);
    localStorage.setItem('ayurcare_meal_plan', JSON.stringify(updatedPlan));
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to delete your current food chart and start over?')) {
      setPlan(null);
      localStorage.removeItem('ayurcare_meal_plan');
    }
  };

  // Calculate day total calories
  const getDayTotalCalories = (dayNum: number) => {
    if (!plan) return 0;
    const meals = plan.dayMeals[dayNum];
    if (!meals) return 0;
    return (
      (meals.breakfast?.calories || 0) +
      (meals.lunch?.calories || 0) +
      (meals.snack?.calories || 0) +
      (meals.dinner?.calories || 0)
    );
  };

  // Recipe Explorer Filter
  const filteredRecipes = RECIPES_DB.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.sanskrit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.benefits.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.ingredients.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="ayurvedic-diet-page">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500 rounded-full opacity-30 filter blur-2xl"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            <Utensils className="w-6 h-6 text-gold-100" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-wide">Ayurvedic Diet & Meal Planner</h1>
            <p className="text-emerald-100 text-sm mt-1">
              Personalized meal charts based on target calories, goal setting, allergies, and dynamic daily schedules.
            </p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold text-slate-550">
        <button
          onClick={() => setActiveTab('planner')}
          className={`py-3 px-6 border-b-2 transition cursor-pointer ${
            activeTab === 'planner' ? 'border-primary-600 text-primary-750' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Calorie Meal Planner
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`py-3 px-6 border-b-2 transition cursor-pointer ${
            activeTab === 'recipes' ? 'border-primary-600 text-primary-750' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Browse Recipes ({RECIPES_DB.length}+)
        </button>
        <button
          onClick={() => setActiveTab('guidelines')}
          className={`py-3 px-6 border-b-2 transition cursor-pointer ${
            activeTab === 'guidelines' ? 'border-primary-600 text-primary-750' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          General Diet Guidelines
        </button>
      </div>

      {/* TAB 1: MEAL PLANNER */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          {!plan ? (
            /* WIZARD PROCESS */
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b pb-4 border-slate-100">
                <h3 className="font-display text-lg font-bold text-slate-800 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-primary-655" />
                  Ayurvedic Diet Generator Wizard
                </h3>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">
                  Step {step} of 3
                </span>
              </div>

              {/* STEP 1: CHOOSE GOAL */}
              {step === 1 && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-700">What is your primary medical or health goal?</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Weight Loss', desc: 'Lose excess fat deposits (Kapha) safely with light calorie-deficit plans.', type: 'loss' },
                      { title: 'Weight Gain', desc: 'Build lean muscle mass (Vata nourishing) with calorie-surplus nutrition.', type: 'gain' },
                      { title: 'Medical & Health Improvements', desc: 'Manage chronic acidity, blood sugar, digestion, or joints.', type: 'health' },
                      { title: 'Physical & Functional Benefits', desc: 'Increase active metabolic energy, building physical endurance.', type: 'stamina' },
                      { title: 'Mental & Lifestyle Advantages', desc: 'Quiet anxiety, calm the mind, and facilitate deep restful sleep.', type: 'mental' },
                    ].map((g) => (
                      <div
                        key={g.title}
                        onClick={() => setGoal(g.title)}
                        className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                          goal === g.title ? 'border-primary-500 bg-primary-50/10' : 'border-slate-205 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <strong className="text-xs text-slate-800 block font-bold">{g.title}</strong>
                          <span className="text-[11px] text-slate-550 text-slate-500 mt-1 block">{g.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 bg-primary-600 hover:bg-primary-750 text-white rounded-xl text-xs font-bold transition flex items-center shadow-sm cursor-pointer"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-1.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: METRICS */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* If Weight Loss/Gain */}
                  {goal.includes('Weight') ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                      <div className="space-y-2">
                        <label htmlFor="weight" className="block font-bold text-slate-700">What is your current weight (kg)?</label>
                        <input
                          id="weight"
                          type="number"
                          value={currentWeight}
                          onChange={(e) => setCurrentWeight(Math.max(30, parseInt(e.target.value) || 0))}
                          className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="targetWeight" className="block font-bold text-slate-700">How much weight (kg) do you want to {goal === 'Weight Loss' ? 'lose' : 'gain'}?</label>
                        <input
                          id="targetWeight"
                          type="number"
                          value={weightChange}
                          onChange={(e) => setWeightChange(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 border border-slate-100 rounded-xl">
                      <strong className="block text-slate-800 font-bold mb-1">Standard Daily Caloric Setup:</strong>
                      For general health improvements or lifestyle advantages, the system allocates a balanced daily nutrition goal of 1800 kcal to maintain energy equilibrium.
                    </div>
                  )}

                  {/* Calculated summary */}
                  {goal.includes('Weight') && (
                    <div className="bg-primary-50/20 border border-primary-100 rounded-xl p-4 text-xs space-y-1">
                      <strong className="text-primary-750 block font-bold">Dynamic Plan Calculation:</strong>
                      <p className="text-slate-600">
                        At a healthy and safe rate of 0.5 kg per week, it will take approximately{' '}
                        <strong className="text-primary-700 font-bold">{Math.round(weightChange * 14)} days</strong> to achieve your target.
                      </p>
                      <p className="text-slate-500 text-[11px] mt-1">
                        Daily calorie limit will be locked at:{' '}
                        <strong className="text-slate-700 font-bold">{targetCalories} kcal</strong>
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="px-6 py-2.5 bg-primary-600 hover:bg-primary-750 text-white rounded-xl text-xs font-bold transition flex items-center shadow-sm cursor-pointer"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-1.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ALLERGIES & RESTRICTIONS */}
              {step === 3 && (
                <div className="space-y-6 text-xs font-semibold">
                  {/* Allergies */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">Check any food allergies (these will be skipped):</label>
                    <div className="flex flex-wrap gap-3">
                      {['Gluten', 'Dairy', 'Nuts', 'Soy', 'Nightshades'].map((a) => (
                        <label
                          key={a}
                          className={`flex items-center space-x-2 px-4 py-2 border rounded-xl cursor-pointer transition select-none ${
                            allergies.includes(a.toLowerCase()) ? 'border-primary-500 bg-primary-50/10 font-bold' : 'border-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={allergies.includes(a.toLowerCase())}
                            onChange={() => toggleAllergy(a.toLowerCase())}
                            className="hidden"
                          />
                          <span>{a}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Exclusions */}
                  <div className="space-y-2">
                    <label htmlFor="exclusions" className="block font-bold text-slate-700">Exclude specific ingredients (comma separated):</label>
                    <input
                      id="exclusions"
                      type="text"
                      placeholder="e.g. Garlic, Onion, Spinach, Honey"
                      value={exclusionsInput}
                      onChange={(e) => setExclusionsInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleGeneratePlan}
                      className="px-6 py-2.5 bg-primary-600 hover:bg-primary-750 text-white rounded-xl text-xs font-bold transition flex items-center shadow-sm cursor-pointer"
                    >
                      Generate Food Chart <Apple className="w-4 h-4 ml-1.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* DYNAMIC PLAN DASHBOARD */
            <div className="space-y-6">
              {/* Summary Bar */}
              <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-primary-600 rounded-full text-white uppercase tracking-wide">
                      Active Diet Plan
                    </span>
                    <span className="text-xs text-slate-400">Target: {plan.goal}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-100">
                    Your Personal {plan.durationDays}-Day Food Chart
                  </h3>
                  <p className="text-slate-450 text-slate-400 text-xs">
                    Target Deficit: <strong className="text-slate-200 font-bold">{plan.targetCalories} kcal/day</strong>
                    {plan.allergies.length > 0 && ` | Skips: ${plan.allergies.join(', ')}`}
                  </p>
                </div>

                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-slate-800 bg-slate-950 text-slate-350 hover:bg-slate-800 hover:text-white rounded-xl text-xs font-bold transition flex items-center cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Start New Chart
                </button>
              </div>

              {/* Day Selector Slider Bar */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block px-1">Select Active Day</span>
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin">
                  {Array.from({ length: plan.durationDays }, (_, i) => i + 1).map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex-shrink-0 cursor-pointer ${
                        selectedDay === d
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      Day {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day target vs Current total */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs font-bold text-slate-600 flex justify-between items-center">
                <span>Day {selectedDay} Calorie Weight:</span>
                <span className={`px-2 py-0.5 rounded ${
                  getDayTotalCalories(selectedDay) <= plan.targetCalories ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {getDayTotalCalories(selectedDay)} / {plan.targetCalories} kcal
                </span>
              </div>

              {/* Meal Cards Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['breakfast', 'lunch', 'snack', 'dinner'].map((mealType) => {
                  const meal = plan.dayMeals[selectedDay]?.[mealType];
                  if (!meal) return null;

                  return (
                    <div key={mealType} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full tracking-wider">
                            {mealType}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">{meal.calories} kcal</span>
                        </div>

                        <div className="mt-3">
                          <h4 className="font-display font-bold text-base text-slate-800 line-clamp-1">{meal.name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold block italic">{meal.sanskrit}</span>
                        </div>

                        <p className="text-xs text-slate-550 text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {meal.benefits}
                        </p>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => setActiveRecipe(meal)}
                          className="flex-1 py-2 bg-primary-600 hover:bg-primary-750 text-white rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer"
                        >
                          View Recipe
                        </button>
                        <button
                          onClick={() => handleSwapMeal(mealType)}
                          className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer"
                          title="Swap for different meal of equivalent calories"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECIPE EXPLORER */}
      {activeTab === 'recipes' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow max-w-lg">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search all recipes by name or ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-650 text-slate-800 text-xs"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold">Showing {filteredRecipes.length} recipes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.slice(0, 30).map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 rounded-full text-slate-500">
                      {recipe.mealType}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{recipe.calories} kcal</span>
                  </div>
                  <h4 className="font-display font-bold text-base text-slate-805 text-slate-800">{recipe.name}</h4>
                  <span className="text-[10px] text-slate-400 block italic">{recipe.sanskrit}</span>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{recipe.benefits}</p>
                </div>

                <button
                  onClick={() => setActiveRecipe(recipe)}
                  className="w-full py-2 bg-slate-50 hover:bg-primary-600 hover:text-white border border-slate-150 rounded-xl mt-4 text-xs font-bold transition flex items-center justify-center cursor-pointer"
                >
                  View Cooking Steps
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DIET GUIDELINES */}
      {activeTab === 'guidelines' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-800">Ayurvedic Eating Principles</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Food is dynamic energy. How you eat is just as important as what you eat to support health improvements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
            <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-2">
              <strong className="text-indigo-850 block font-bold">1. Eat Warm Cooked Meals</strong>
              <p className="leading-relaxed">Warm cooked foods are loaded with metabolic fire (Agni). Raw cold salads are heavy and difficult to process, generating Ama (waste).</p>
            </div>
            <div className="p-4 bg-amber-50/30 border border-amber-100 rounded-xl space-y-2">
              <strong className="text-amber-850 block font-bold">2. Mindful Eating Habit</strong>
              <p className="leading-relaxed">Eat in a calm setting without screens or multitasking. Chew your food until liquid to ease digestive absorption.</p>
            </div>
            <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl space-y-2">
              <strong className="text-emerald-850 block font-bold">3. Space Your Meals</strong>
              <p className="leading-relaxed">Allow at least 4-6 hours between meals. Avoid continuous snacking, which interrupts the digestive sequence.</p>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {activeRecipe && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl space-y-6 relative animate-slideUp">
            
            <button
              onClick={() => setActiveRecipe(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer font-bold"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider block">Ayurvedic Kitchen Pharmacy</span>
              <h2 className="font-display font-extrabold text-xl text-slate-800 mt-1">{activeRecipe.name}</h2>
              <span className="text-xs text-slate-400 font-medium italic block mt-0.5">{activeRecipe.sanskrit}</span>
            </div>

            <div className="flex space-x-4 text-xs font-bold text-slate-505 text-slate-500 border-y py-2 border-slate-100">
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-primary-600" /> Meal Type: {activeRecipe.mealType}</span>
              <span className="flex items-center"><User className="w-4 h-4 mr-1 text-primary-600" /> Target Calories: {activeRecipe.calories} kcal</span>
            </div>

            {/* Ingredients */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Ingredients</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                {activeRecipe.ingredients.map((ing) => (
                  <li key={ing} className="flex items-center space-x-2">
                    <span className="text-primary-600 font-bold">•</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Preparation Instructions</h4>
              <ol className="space-y-3 text-xs text-slate-600 list-decimal pl-4">
                {activeRecipe.instructions.map((step, idx) => (
                  <li key={idx} className="leading-relaxed pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center justify-center p-2 bg-slate-50 rounded-lg">
              <HelpCircle className="w-4 h-4 mr-1.5 text-primary-650 text-primary-600 flex-shrink-0" />
              <span>Ayurvedic Tip: Consume fresh. Reheating leftovers creates dull, lifeless energy (Tamas).</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
