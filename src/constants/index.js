export const INGREDIENTS_SUGGESTIONS = [
  { label: "chicken", emoji: "🍗" },
  { label: "garlic", emoji: "🧄" },
  { label: "lemon", emoji: "🍋" },
  { label: "olive oil", emoji: "🫒" },
  { label: "tomatoes", emoji: "🍅" },
  { label: "pasta", emoji: "🍝" },
  { label: "onion", emoji: "🧅" },
  { label: "eggs", emoji: "🥚" },
  { label: "cheese", emoji: "🧀" },
  { label: "spinach", emoji: "🥬" },
  { label: "mushrooms", emoji: "🍄" },
  { label: "potatoes", emoji: "🥔" },
  { label: "butter", emoji: "🧈" },
  { label: "cream", emoji: "🥛" },
  { label: "basil", emoji: "🌿" },
  { label: "ginger", emoji: "🫚" },
  { label: "soy sauce", emoji: "🍶" },
  { label: "rice", emoji: "🍚" },
  { label: "salmon", emoji: "🐟" },
  { label: "avocado", emoji: "🥑" },
  { label: "tofu", emoji: "🟨" },
  { label: "beef", emoji: "🥩" },
];

export const EMOJI_MAP = Object.fromEntries(
  INGREDIENTS_SUGGESTIONS.map(({ label, emoji }) => [label, emoji])
);

export const CUISINES = [
  { id: "any", label: "Any", emoji: "🌍" },
  { id: "italian", label: "Italian", emoji: "🇮🇹" },
  { id: "asian", label: "Asian", emoji: "🥢" },
  { id: "mexican", label: "Mexican", emoji: "🌮" },
  { id: "indian", label: "Indian", emoji: "🫕" },
  { id: "mediterranean", label: "Mediterranean", emoji: "🫙" },
  { id: "american", label: "American", emoji: "🍔" },
  { id: "french", label: "French", emoji: "🥐" },
  { id: "japanese", label: "Japanese", emoji: "🍱" },
];

export const DIETS = [
  { id: "none", label: "No restriction", emoji: "🍽️" },
  { id: "vegetarian", label: "Vegetarian", emoji: "🥗" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "gluten-free", label: "Gluten-Free", emoji: "🌾" },
  { id: "keto", label: "Keto", emoji: "🥑" },
  { id: "dairy-free", label: "Dairy-Free", emoji: "🚫🧀" },
  { id: "high-protein", label: "High Protein", emoji: "💪" },
];

export const DIFFICULTIES = [
  { id: "easy", label: "Easy", emoji: "😊", desc: "30 min or less" },
  { id: "medium", label: "Medium", emoji: "👨‍🍳", desc: "30–60 min" },
  { id: "hard", label: "Advanced", emoji: "⭐", desc: "60+ min" },
];

export const MOODS = [
  { id: "comfort", label: "Comfort Food", emoji: "🤗" },
  { id: "healthy", label: "Light & Healthy", emoji: "🥦" },
  { id: "festive", label: "Special Occasion", emoji: "🥂" },
  { id: "quick", label: "Quick Meal", emoji: "⚡" },
  { id: "gourmet", label: "Gourmet", emoji: "👑" },
];

export const buildSystemPrompt = ({ cuisine, diet, difficulty, mood }) => `You are Rectify — an elite culinary AI with the warmth of a home chef and the skill of a Michelin-star cook.

User preferences:
- Cuisine style: ${cuisine !== "any" ? cuisine : "any cuisine"}
- Dietary restriction: ${diet !== "none" ? diet : "none"}
- Difficulty: ${difficulty}
- Mood/occasion: ${mood || "any"}

Generate a complete recipe matching these preferences using the given ingredients.

Format your response EXACTLY like this:

🍽️ **[Creative Recipe Name]**

⭐ **Difficulty** · ⏱️ **[X] min** · 🍴 **Serves [X]** · 🔥 **~[X] kcal/serving**

---

📝 **Ingredients**
• [quantity] [ingredient]
• [quantity] [ingredient]

👨‍🍳 **Instructions**
1. [Detailed step]
2. [Detailed step]

💡 **Chef's Secret**
[One brilliant pro tip that elevates this dish]

🔄 **Smart Swaps**
• [ingredient] → [substitute if unavailable]

🏷️ **Tags:** #[tag] #[tag] #[tag]

Be enthusiastic, precise, and make the recipe feel special. Match the difficulty and cuisine preference exactly.`;

export const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "👋 Welcome to **Rectify**!\n\nI'm your personal AI chef. Add your ingredients, set your preferences — cuisine style, diet, difficulty — and I'll craft a perfect recipe tailored just for you.\n\nTip: The more specific you are, the more magical the result. ✨",
};
