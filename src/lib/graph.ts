// FILE: src/lib/graph.ts
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface GraphNode {
  id: string;
  name: string;
  val: number; 
  group: number; 
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export async function extractGraphData(context: string): Promise<GraphData> {
  if (!context || context.trim().length < 10) {
    return { nodes: [], links: [] };
  }

  const systemPrompt = `
    You are a Knowledge Graph Architect. 
    Extract the most important entities and their relationships from the text.
    Return ONLY a JSON object:
    {
      "nodes": [{"id": "unique_id", "name": "Label", "group": 1, "val": 10}],
      "links": [{"source": "id1", "target": "id2", "label": "Relation"}]
    }
    Groups: 1: Main Concept, 2: Supporting Detail, 3: Technical Term, 4: Person/Organization.
    Importance (val): 1-20 based on how central the concept is.
    Limit to 15-20 nodes for clarity.
  `;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: context.slice(0, 8000) }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || '{"nodes":[], "links":[]}';
    return JSON.parse(content);
  } catch (error) {
    console.error("Graph AI Error:", error);
    return { nodes: [], links: [] };
  }
}