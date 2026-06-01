export default async function handler(req: any, res: any) {
  try {
    const serverModule = await import("../server.js");
    return serverModule.default(req, res);
  } catch (error: any) {
    console.error("[VERCEL HANDLER ERROR]:", error);
    res.status(500).json({
      error: "Vercel Serverless Function Load Error",
      message: error.message,
      stack: error.stack ? error.stack.split("\n") : null,
    });
  }
}



