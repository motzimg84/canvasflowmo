// PROJECT: CanvasFlow Pro
// MODULE: AI Assistant Edge Function

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildSystemPrompt(projects: any[], activities: any[], language: string) {
  const langName = language === 'es' ? 'Spanish' : language === 'pt' ? 'Portuguese' : language === 'de' ? 'German' : language === 'fr' ? 'French' : language === 'it' ? 'Italian' : 'English';

  return `You are an AI assistant for CanvasFlow Pro, a project and activity management application.
You are a "Superuser" orchestrator with full read/write access to ALL activity fields.

Current context:
- Language: ${language} (respond in ${langName})
- Today's date: ${new Date().toISOString().split('T')[0]}
- Projects: ${JSON.stringify(projects.map((p: any) => ({ name: p.name, id: p.id, color: p.color })))}
- Activities (ALL fields): ${JSON.stringify(activities.map((a: any) => ({ title: a.title, id: a.id, status: a.status, project_id: a.project_id, start_date: a.start_date, duration_days: a.duration_days, progress: a.progress, notes: a.notes })))}

CAPABILITIES:
1. Create projects (create_project)
2. Move activities between statuses (move_activity)
3. Switch UI language (switch_language)
4. Create activities with ALL fields (create_activity) — extract dates, durations, progress from natural language
5. Delete activities (delete_activity)
6. Edit any activity field: title, start_date, duration_days, progress, notes, project_id (update_activity)
7. Batch-create multiple activities from a text block (batch_create_activities) — parse freeform text into structured tasks

SMART EXTRACTION RULES:
- When users paste a block of text with multiple tasks, use batch_create_activities to parse them all at once.
- Extract dates relative to today (e.g., "tomorrow" = today + 1 day).
- Extract durations (e.g., "2 hours" = 0.08 days, "3 days" = 3).
- Extract progress percentages (e.g., "at 50%" = 50).
- When a user mentions an activity by partial name, fuzzy-match it to the closest existing activity.
- If text is ambiguous (e.g., could refer to multiple activities), ask for clarification BEFORE committing.

IMPORTANT: When users reference projects/activities by name, always match to IDs from the context above.
Always respond in ${langName}. Be helpful and concise.`;
}

const tools = [
  {
    type: "function",
    function: {
      name: "create_project",
      description: "Create a new project with auto-assigned color",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name of the project" }
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
          activity_id: { type: "string", description: "The ID of the activity" },
          new_status: { type: "string", enum: ["todo", "doing", "finished"], description: "The new status" }
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
          language: { type: "string", enum: ["en", "es", "pt", "de", "fr", "it"], description: "Language code" }
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
      description: "Create a single activity with full field support. Use batch_create_activities for multiple tasks.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Activity title" },
          project_id: { type: "string", description: "Project ID to assign to (optional)" },
          start_date: { type: "string", description: "Start date in YYYY-MM-DD format (optional, defaults to today)" },
          duration_days: { type: "number", description: "Duration in days (optional)" },
          progress: { type: "number", description: "Execution percentage 0-100 (optional)" },
          notes: { type: "string", description: "Notes content in HTML (optional)" }
        },
        required: ["title"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_activity",
      description: "Delete an activity by ID",
      parameters: {
        type: "object",
        properties: {
          activity_id: { type: "string", description: "The ID of the activity to delete" }
        },
        required: ["activity_id"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_activity",
      description: "Update any field(s) of an existing activity: title, project_id, start_date, duration_days, progress, notes. Only include fields you want to change.",
      parameters: {
        type: "object",
        properties: {
          activity_id: { type: "string", description: "The ID of the activity to update" },
          title: { type: "string", description: "New title (optional)" },
          project_id: { type: "string", description: "New project ID or null to unassign (optional)" },
          start_date: { type: "string", description: "New start date YYYY-MM-DD (optional)" },
          duration_days: { type: "number", description: "New duration in days (optional)" },
          progress: { type: "number", description: "New progress 0-100 (optional)" },
          notes: { type: "string", description: "New notes content in HTML (optional)" }
        },
        required: ["activity_id"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "batch_create_activities",
      description: "Create multiple activities at once from parsed text. Each activity can have all fields. Use this when the user provides a block of text with multiple tasks.",
      parameters: {
        type: "object",
        properties: {
          activities: {
            type: "array",
            description: "Array of activities to create",
            items: {
              type: "object",
              properties: {
                title: { type: "string", description: "Activity title" },
                project_id: { type: "string", description: "Project ID (optional)" },
                start_date: { type: "string", description: "Start date YYYY-MM-DD (optional)" },
                duration_days: { type: "number", description: "Duration in days (optional)" },
                progress: { type: "number", description: "Progress 0-100 (optional)" },
                notes: { type: "string", description: "Notes in HTML (optional)" }
              },
              required: ["title"],
              additionalProperties: false
            }
          }
        },
        required: ["activities"],
        additionalProperties: false
      }
    }
  }
];

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

    const systemPrompt = buildSystemPrompt(projects, activities, language);

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
