// PROJECT: CanvasFlow Pro
// MODULE: AI Assistant Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, projects, activities, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an AI assistant for CanvasFlow Pro, a project and activity management application.

Current context:
- Language: ${language} (respond in this language)
- Projects: ${JSON.stringify(projects.map((p: { name: string; id: string; color: string }) => ({ name: p.name, id: p.id, color: p.color })))}
- Activities: ${JSON.stringify(activities.map((a: { title: string; id: string; status: string; project_id: string | null }) => ({ title: a.title, id: a.id, status: a.status, project_id: a.project_id })))}

You can help users by:
1. Creating new projects (use create_project tool)
2. Moving activities between statuses (use move_activity tool)
3. Switching the UI language (use switch_language tool)
4. Creating new activities/tasks (use create_activity tool)

Always respond in the user's language (${language === 'es' ? 'Spanish' : language === 'pt' ? 'Portuguese' : 'English'}).
Be helpful and concise.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "create_project",
          description: "Create a new project with auto-assigned color",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The name of the project to create"
              }
            },
            required: ["name"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "move_activity",
          description: "Move an activity to a different status (todo, doing, or finished)",
          parameters: {
            type: "object",
            properties: {
              activity_id: {
                type: "string",
                description: "The ID of the activity to move"
              },
              new_status: {
                type: "string",
                enum: ["todo", "doing", "finished"],
                description: "The new status for the activity"
              }
            },
            required: ["activity_id", "new_status"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "switch_language",
          description: "Switch the UI language",
          parameters: {
            type: "object",
            properties: {
              language: {
                type: "string",
                enum: ["en", "es", "pt"],
                description: "The language code to switch to (en=English, es=Spanish, pt=Portuguese)"
              }
            },
            required: ["language"],
            additionalProperties: false
          }
        }
      },
      {
        type: "function",
        function: {
          name: "create_activity",
          description: "Create a new activity/task with the given title. Optionally assign it to a project.",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "The title of the activity to create"
              },
              project_id: {
                type: "string",
                description: "Optional: The ID of the project to assign this activity to"
              }
            },
            required: ["title"],
            additionalProperties: false
          }
        }
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
