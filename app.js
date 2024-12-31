import { Hono } from "https://deno.land/x/hono@v3.12.11/mod.ts";

const app = new Hono();
const KV = await Deno.openKv();

const feedbackKeys = ["1", "2", "3", "4", "5"];

app.get("/", async (c) => {
    const feedbackCounts = {};
    for (const key of feedbackKeys) {
        const stored = await KV.get(["feedback", key]);
        feedbackCounts[key] = stored ? stored.value : 0;
    }
    return c.html(`
    <h1>How would you rate this experience?</h1>
    <form method="POST" action="/feedbacks/1"><button type="submit">Poor</button></form>
    <form method="POST" action="/feedbacks/2"><button type="submit">Fair</button></form>
    <form method="POST" action="/feedbacks/3"><button type="submit">Good</button></form>
    <form method="POST" action="/feedbacks/4"><button type="submit">Very good</button></form>
    <form method="POST" action="/feedbacks/5"><button type="submit">Excellent</button></form>
    <h2>Feedback Counts</h2>
    <ul>
      ${feedbackKeys
          .map(
              (key) => `
        <li>Feedback ${key}: ${feedbackCounts[key]}</li>
      `
          )
          .join("")}
    </ul>
  `);
});

app.post("/feedbacks/:feedback", async (c) => {
    const feedback = c.req.param("feedback");
    if (feedbackKeys.includes(feedback)) {
        const feedbackCount = await KV.get(["feedback", feedback]);
        const newCount = feedbackCount ? feedbackCount.value + 1 : 1;
        await KV.set(["feedback", feedback], { value: newCount });
    }
    return c.redirect("/");
});

app.get("/feedbacks/:feedback", async (c) => {
    const feedback = c.req.param("feedback");
    if (feedbackKeys.includes(feedback)) {
        const feedbackCount = await KV.get(["feedback", feedback]);
        return c.text(`Feedback ${feedback}: ${feedbackCount ? feedbackCount.value : 0}`);
    }
    return c.text("Invalid feedback type", 400);
});

export default app;
