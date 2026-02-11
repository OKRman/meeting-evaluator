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
    console.error("CONVERTKIT_API_KEY not set");
    return res.status(200).json({ success: false, error: "Email service not configured" });
  }

  if (!CONVERTKIT_FORM_ID) {
    console.error("CONVERTKIT_FORM_ID not set");
    return res.status(200).json({ success: false, error: "Form ID not configured" });
  }

  console.log("Subscribing:", email, "to form:", CONVERTKIT_FORM_ID);

  const urls = [
    `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
    `https://api.kit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
  ];

  const payload = {
    api_key: CONVERTKIT_API_KEY,
    email: email.trim(),
    first_name: first_name || "",
  };

  for (const url of urls) {
    try {
      console.log("Trying:", url);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("Response status:", response.status, "Body:", responseText);

      if (response.ok) {
        let data;
        try { data = JSON.parse(responseText); } catch (e) { data = {}; }
        console.log("Success! Subscriber added via:", url);
        return res.status(200).json({ success: true, subscriber: data.subscription?.subscriber?.id });
      }
    } catch (err) {
      console.error("Error with", url, ":", err.message);
    }
  }

  console.error("All subscribe attempts failed");
  return res.status(200).json({ success: false, error: "Subscribe failed" });
}
