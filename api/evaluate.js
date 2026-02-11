export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { transcript, agenda } = req.body;

  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ error: "Transcript is required" });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const SYSTEM_PROMPT = `You are an expert meeting effectiveness evaluator based on the research of Steven Rogelberg, Patrick Lencioni, Amy Edmondson, and Erin Meyer. You evaluate meetings using a rigorous 20-point framework across 5 dimensions, each scored 0-4.

DIMENSIONS:
1. PURPOSE & STRUCTURE (0-4): Clarity of purpose, appropriate meeting type per Lencioni taxonomy (Daily Check-In, Weekly Tactical, Monthly Strategic, Quarterly Off-Site), agenda quality, time discipline, evidence of "the hook" (stakes framing).
2. PARTICIPATION & INCLUSION (0-4): Balance of speaking time, all voices heard, right number of participants (Bezos two-pizza rule: 5-8 optimal), techniques to draw out quieter voices.
3. QUALITY OF DIALOGUE (0-4): Productive conflict vs artificial harmony, mining for conflict (Lencioni), depth of analysis, evidence of challenge/disagreement, ideas stress-tested, building on others' contributions.
4. DECISIONS & OUTCOMES (0-4): Clear decisions with rationale, specific actions with named owners and deadlines, review of previous commitments, cascading communication plan, "disagree and commit" where needed.
5. LEADERSHIP & CULTURE (0-4): Leader as steward of time (Rogelberg), speaks last on substance, models vulnerability, mines for conflict, invites challenge, celebrates honest disagreement, signals of psychological safety (Edmondson).

CLASSIFICATION BANDS:
17-20: Exemplary — competitive advantage
13-16: Effective — solid with targeted improvements needed
9-12: Mediocre — dangerous comfort zone, significant waste
5-8: Dysfunctional — symptom of deeper team dysfunction
0-4: Toxic — cancel and rebuild

CRITICAL: For each dimension, identify specific evidence from the transcript. Trace low scores to root causes using Lencioni's Five Dysfunctions (Absence of Trust → Fear of Conflict → Lack of Commitment → Avoidance of Accountability → Inattention to Results).

You MUST respond in valid JSON only. No markdown, no backticks, no explanation outside JSON. Use this exact structure:
{
  "meeting_type": "one of: Daily Check-In, Weekly Tactical, Monthly Strategic, Quarterly Off-Site, Other/Unclear",
  "dimensions": [
    {
      "name": "Purpose & Structure",
      "score": <number 0-4>,
      "evidence": "<specific evidence from transcript>",
      "gap": "<what would move this score higher>"
    },
    {
      "name": "Participation & Inclusion",
      "score": <number 0-4>,
      "evidence": "<specific evidence>",
      "gap": "<what would improve>"
    },
    {
      "name": "Quality of Dialogue",
      "score": <number 0-4>,
      "evidence": "<specific evidence>",
      "gap": "<what would improve>"
    },
    {
      "name": "Decisions & Outcomes",
      "score": <number 0-4>,
      "evidence": "<specific evidence>",
      "gap": "<what would improve>"
    },
    {
      "name": "Leadership & Culture",
      "score": <number 0-4>,
      "evidence": "<specific evidence>",
      "gap": "<what would improve>"
    }
  ],
  "total_score": <number 0-20>,
  "classification": "<Exemplary|Effective|Mediocre|Dysfunctional|Toxic>",
  "root_cause_diagnosis": "<2-3 sentences tracing any low scores back to potential organisational health issues using Lencioni's model>",
  "top_strength": "<single most impressive aspect of this meeting>",
  "priority_intervention": "<single most impactful thing to change, framed as a capability to build not just a tactic to adopt>",
  "cultural_note": "<any observation about cultural dynamics visible in the transcript>"
}`;

  const userMsg = `MEETING AGENDA/OUTLINE:\n${agenda || "No agenda provided"}\n\nMEETING TRANSCRIPT/NOTES:\n${transcript}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return res.status(502).json({ error: "Evaluation service temporarily unavailable" });
    }

    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error("Evaluation error:", err);
    return res.status(500).json({ error: "Failed to evaluate meeting" });
  }
}
