export async function calculateStampDuty(payload) {
  const res = await fetch("http://localhost:4000/api/stamp-duty/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
}
