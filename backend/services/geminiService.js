const axios = require('axios');

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

// ── Helper: call Gemini and parse JSON ───────────────────
// const callGemini = async (prompt, retries = 3) => {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const response = await axios.post(GEMINI_URL, {
//         contents: [{ parts: [{ text: prompt }] }],
//         generationConfig: {
//           temperature: 0.3,
//           maxOutputTokens: 2048,
//           thinkingConfig: {
//             thinkingBudget: 0  // disable thinking — saves quota
//           }
//         }
//       });

//       const rawText = response.data.candidates[0].content.parts[0].text;
//       const cleaned = rawText
//         .replace(/```json/gi, '')
//         .replace(/```/g, '')
//         .trim();

//       return JSON.parse(cleaned);

//     } catch (err) {
//       console.log('❌ Gemini Error Status:', err.response?.status);
//       console.log('❌ Gemini Error Details:', JSON.stringify(err.response?.data, null, 2));

//       const status = err.response?.status;
//       if (status === 429) {
//         const waitTime = (i + 1) * 15000;
//         console.log(`⏳ Waiting ${waitTime / 1000}s... Retry ${i + 1}/${retries}`);
//         await new Promise(resolve => setTimeout(resolve, waitTime));
//       } else {
//         throw err;
//       }
//     }
//   }
//   throw new Error('Gemini rate limit exceeded. Please try again in 1 minute.');
// };
const callGemini = async (prompt, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(GEMINI_URL, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,  // ← increased from 2048
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const rawText = response.data.candidates[0].content.parts[0].text;
      const cleaned = rawText
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      return JSON.parse(cleaned);

    } catch (err) {
      console.log('❌ Gemini Error Status:', err.response?.status);
      console.log('❌ Gemini Error Details:', JSON.stringify(err.response?.data, null, 2));

      const status = err.response?.status;
      if (status === 429) {
        const waitTime = (i + 1) * 15000;
        console.log(`⏳ Waiting ${waitTime / 1000}s... Retry ${i + 1}/${retries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Gemini rate limit exceeded. Please try again in 1 minute.');
};
// ────────────────────────────────────────────────────────
// Analyze Resume
// ────────────────────────────────────────────────────────
exports.analyzeResumeWithAI = async (resumeText) => {
  const prompt = `
You are an expert ATS resume analyzer and career coach.

Analyze the following resume text and return ONLY a valid JSON object.
No explanation, no markdown, no extra text — ONLY raw JSON.

Resume Text:
"""
${resumeText.substring(0, 4000)}
"""

Return this exact JSON:
{
  "atsScore": <number 0-100>,
  "experienceLevel": "<Fresher | Junior | Mid-Level | Senior>",
  "summary": "<2-3 sentence professional summary>",
  "detectedSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Rules:
- atsScore based on keywords, formatting, sections, achievements
- minimum 3, maximum 8 items per array
- Return ONLY the JSON, nothing else
`;

  return await callGemini(prompt);
};

// ────────────────────────────────────────────────────────
// Generate Roadmap
// ────────────────────────────────────────────────────────
exports.generateRoadmap = async (currentSkills, targetRole) => {
  const prompt = `
You are an expert developer career coach.

Current skills: ${currentSkills.join(', ')}
Target role: ${targetRole}

Return ONLY a valid JSON object. No markdown, no explanation.

{
  "missingSkills": ["skill1", "skill2"],
  "totalWeeks": <number>,
  "phases": [
    {
      "phase": 1,
      "title": "<phase title>",
      "skills": ["skill1", "skill2"],
      "weeks": <number>,
      "description": "<what to learn>",
      "resources": ["resource1", "resource2"]
    }
  ]
}

Rules:
- Create 4 to 6 phases
- Each phase builds on previous
- totalWeeks = sum of all phase weeks
- Return ONLY the JSON
`;

  return await callGemini(prompt);
};

// ────────────────────────────────────────────────────────
// AI Career Coach
// ────────────────────────────────────────────────────────
exports.askCareerCoach = async (question, userContext) => {
  const prompt = `
You are an expert developer career coach named "GPS Coach".

User context:
- Skills: ${userContext.skills?.join(', ') || 'Not provided'}
- Role: ${userContext.role || 'fresher'}
- Experience: ${userContext.experience || '0'} years

User question: "${question}"

Give a helpful, specific, practical answer in 3-5 sentences.
Focus on actionable advice. Be encouraging but realistic.
Do not use markdown formatting.
`;

  const response = await axios.post(GEMINI_URL, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  return response.data.candidates[0].content.parts[0].text.trim();
};
// ────────────────────────────────────────────────────────
// Generate Weekly Plan from Roadmap Phases
// ────────────────────────────────────────────────────────
// exports.generateWeeklyPlan = async (phases, targetRole) => {
//   const prompt = `
// You are an expert developer career coach.

// Target role: ${targetRole}
// Learning phases: ${JSON.stringify(phases.map(p => ({
//   phase: p.phase,
//   title: p.title,
//   skills: p.skills,
//   weeks: p.weeks
// })))}

// Generate a detailed week-by-week learning plan.
// Return ONLY valid JSON. No markdown, no explanation.

// {
//   "weeklyPlan": [
//     {
//       "week": 1,
//       "title": "<week focus title>",
//       "phase": 1,
//       "tasks": [
//         "<specific task 1>",
//         "<specific task 2>",
//         "<specific task 3>"
//       ]
//     }
//   ]
// }

// Rules:
// - Total weeks must match sum of phase weeks
// - Each week has 3-5 specific tasks
// - Tasks must be very specific and actionable
// - Return ONLY the JSON
// `;

//   return await callGemini(prompt);
// };
exports.generateWeeklyPlan = async (phases, targetRole) => {
  const prompt = `
You are an expert developer career coach.

Target role: ${targetRole}
Learning phases: ${JSON.stringify(phases.map(p => ({
  phase: p.phase,
  title: p.title,
  skills: p.skills,
  weeks: p.weeks
})))}

Generate a week-by-week learning plan.
Return ONLY valid JSON. No markdown, no explanation.

{
  "weeklyPlan": [
    {
      "week": 1,
      "title": "<week focus>",
      "phase": 1,
      "tasks": ["task1", "task2", "task3"]
    }
  ]
}

STRICT RULES:
- Each week has EXACTLY 3 tasks only (not more)
- Task text must be SHORT — max 8 words each
- Total weeks must match sum of phase weeks
- Return ONLY the JSON, nothing else
- Do NOT add explanation or comments
`;

  const response = await axios.post(GEMINI_URL, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,   // ← increased from 2048
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  const rawText = response.data.candidates[0].content.parts[0].text;
  const cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleaned);
};
// ────────────────────────────────────────────────────────
// Skill Gap Analysis
// ────────────────────────────────────────────────────────
exports.analyzeSkillGap = async (currentSkills, targetRole) => {
  const prompt = `
You are an expert developer career coach.

Current skills: ${currentSkills.join(', ')}
Target role: ${targetRole}

Analyze the skill gap and return ONLY valid JSON. No markdown.

{
  "matchPercentage": <number 0-100>,
  "readinessLevel": "<Not Ready | Beginner | Intermediate | Almost Ready | Ready>",
  "strongSkills": ["skill1", "skill2"],
  "missingCritical": ["must-have skill1", "must-have skill2"],
  "missingNiceToHave": ["good-to-have skill1", "good-to-have skill2"],
  "estimatedMonths": <number>,
  "summary": "<2-3 sentence gap analysis summary>"
}

Rules:
- matchPercentage: how close current skills are to target role
- missingCritical: skills absolutely required for the role
- missingNiceToHave: skills that help but not mandatory
- Return ONLY the JSON
`;

  return await callGemini(prompt);
};