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
    if (payload.action !== "created") {
      return new Response("OK");
    }

    const {
      repository: { full_name: repo },
      sender: { login: user, html_url: url },
    } = payload;

    const params = new URLSearchParams({
      token: env.PUSHOVER_TOKEN,
      user: env.PUSHOVER_USER,
      message: `⭐ ${user} starred ${repo}!`,
      title: "New GitHub Star",
      url,
    });

    await fetch("https://api.pushover.net/1/messages.json", {
      method: "POST",
      body: params,
    });
  },
};

async function sendPushover(env, message) {}
