export async function GET() { return new Response(JSON.stringify({ ok: true, app: "prompter-ai-web" }), { headers: { "content-type": "application/json" } }); }
