export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, first_name, meeting_score, meeting_classification } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: "Email is required" });
  }

  const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
  const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID;

  if (!CONVERTKIT_API_KEY) {
    return res.status(500).json({ error: "Email service not configured" });
  }

  try {
    // Subscribe to ConvertKit form
    const ckUrl = CONVERTKIT_FORM_ID
      ? `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`
      : `https://api.convertkit.com/v3/tags/${process.env.CONVERTKIT_TAG_ID || "meeting-evaluator"}/subscribe`;

    const response = await fetch(ckUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: CONVERTKIT_API_KEY,
        email: email.trim(),
        first_name: first_name || "",
        fields: {
          meeting_score: String(meeting_score || ""),
          meeting_classification: meeting_classification || "",
          source: "meeting-evaluator",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("ConvertKit error:", errText);
      // Still return success to user — don't block the report download
      // just because email failed
      return res.status(200).json({ success: true, warning: "Email service issue" });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, subscriber: data.subscription?.subscriber?.id });
  } catch (err) {
    console.error("Subscribe error:", err);
    // Graceful degradation — don't block user experience
    return res.status(200).json({ success: true, warning: "Email service temporarily unavailable" });
  }
}
