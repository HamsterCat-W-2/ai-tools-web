import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params;
  const filePath = pathSegments.join("/");

  if (filePath === "tools.json") {
    const dataPath = path.join(process.cwd(), "..", "data", "tools.json");

    try {
      const fileContent = fs.readFileSync(dataPath, "utf-8");
      const data = JSON.parse(fileContent);
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error reading data file:", error);
      return new Response(
        JSON.stringify({ error: "Data file not found", path: dataPath }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Not found" }),
    { status: 404, headers: { "Content-Type": "application/json" } }
  );
}
