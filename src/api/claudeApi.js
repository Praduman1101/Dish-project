import { buildSystemPrompt } from "../constants";

const MODEL = "gemini-2.5-flash-lite";
const API_KEY = "AIzaSyA0CF-rUOdUNgcFGcA5RHuNq--PWm5Hnx4";

function getUrl() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
}

// Gemini strict rules:
//  1. First message MUST be role "user" — never "model"
//  2. Roles must strictly alternate: user → model → user → model
//  3. No two consecutive messages with the same role
function toGeminiContents(messages) {
  // Drop any leading assistant messages
  const filtered = [...messages];
  while (filtered.length && filtered[0].role !== "user") {
    filtered.shift();
  }

  // Merge consecutive same-role messages to enforce alternation
  const merged = [];
  for (const msg of filtered) {
    const geminiRole = msg.role === "assistant" ? "model" : "user";
    const last = merged[merged.length - 1];
    if (last && last.role === geminiRole) {
      last.parts[0].text += "\n" + msg.content;
    } else {
      merged.push({ role: geminiRole, parts: [{ text: msg.content }] });
    }
  }

  return merged;
}

async function callGemini({ system, messages, maxTokens = 1200 }) {
  const contents = toGeminiContents(messages);

  if (contents.length === 0) {
    throw new Error("No valid messages to send.");
  }

  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { maxOutputTokens: maxTokens },
  };

  const response = await fetch(getUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini.");
  return text;
}

export async function sendMessage(history, preferences = {}) {
  return callGemini({
    system: buildSystemPrompt(preferences),
    messages: history,
    maxTokens: 1200,
  });
}

export async function getSmartSubstitution(ingredient, context) {
  return callGemini({
    system:
      "You are a culinary expert. Suggest 3 ingredient substitutions concisely. Format each as: '✅ **[substitute]** — [why it works (1 sentence)]'. No preamble.",
    messages: [
      {
        role: "user",
        content: `I need substitutes for **${ingredient}**${
          context ? ` in this recipe context: ${context.slice(0, 300)}` : ""
        }. Give me 3 options.`,
      },
    ],
    maxTokens: 300,
  });
}

export async function analyzeNutrition(recipe) {
  const raw = await callGemini({
    system:
      "You are a nutrition expert. Return ONLY a JSON object — no markdown fences, no explanation. Schema: { calories: number, protein: string, carbs: string, fat: string, fiber: string, highlights: string[] }",
    messages: [
      {
        role: "user",
        content: `Estimate nutrition per serving:\n${recipe.slice(0, 800)}`,
      },
    ],
    maxTokens: 400,
  });

  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

export async function scaleRecipe(recipe, servings) {
  return callGemini({
    system:
      "You are a culinary assistant. Scale the recipe to the requested servings. Adjust all ingredient quantities proportionally. Keep the exact same formatting as the original recipe.",
    messages: [
      {
        role: "user",
        content: `Scale this recipe to serve ${servings} people:\n\n${recipe}`,
      },
    ],
    maxTokens: 800,
  });
}
