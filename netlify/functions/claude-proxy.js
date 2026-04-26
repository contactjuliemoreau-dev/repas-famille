exports.handler = async function(event, context) {
  console.log("Method:", event.httpMethod);
  console.log("Has API key:", !!process.env.ANTHROPIC_API_KEY);
  console.log("Body:", event.body ? event.body.substring(0, 100) : "empty");

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("ERROR: No API key");
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY not set" })
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log("Calling Anthropic, model:", body.model);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body)
    });

    console.log("Anthropic status:", response.status);
    const text = await response.text();
    console.log("Anthropic response (first 100):", text.substring(0, 100));

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: text
    };
  } catch (err) {
    console.log("ERROR:", err.message);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message })
    };
  }
};
