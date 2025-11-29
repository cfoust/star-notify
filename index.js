export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("OK"); // GitHub pings GET sometimes
    }

    const body = await request.text();

    const event = request.headers.get("X-GitHub-Event");
    if (event !== "star") {
      return new Response("Ignoring non-star event");
    }

    const payload = JSON.parse(body);

    if (payload.action === "created") {
      // A new star was added
      const repo = payload.repository.full_name;
      const user = payload.sender.login;

      const msg = `⭐ ${user} starred ${repo}!`;

      await sendPushover(env, msg);
    }

    return new Response("OK");
  },
};

async function sendPushover(env, message) {
  const body = new URLSearchParams({
    token: env.PUSHOVER_TOKEN,
    user: env.PUSHOVER_USER,
    message,
    title: "New GitHub Star",
  });

  await fetch("https://api.pushover.net/1/messages.json", {
    method: "POST",
    body,
  });
}
