import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { noteContent } = await req.json();
    
    if (!noteContent || noteContent.length < 10) {
      return new Response(
        JSON.stringify({ snippets: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing note content for code suggestions...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert code assistant that analyzes notes and suggests relevant code snippets. 
Extract key programming concepts, algorithms, or tasks from the user's notes and provide 2-4 highly relevant code examples.
Return your response as a JSON array with this exact structure:
[
  {
    "language": "python" | "javascript" | "java" | "cpp" | "typescript",
    "code": "actual working code here",
    "description": "brief description of what this code does",
    "relevance": number between 60-100 representing how relevant this is
  }
]

Focus on:
- Algorithms and data structures mentioned
- Programming patterns or paradigms discussed
- Specific functions or operations described
- Common use cases related to the topic

Provide complete, working code snippets that are practical and educational.`
          },
          {
            role: 'user',
            content: `Analyze these notes and suggest relevant code snippets:\n\n${noteContent}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_code_snippets",
              description: "Return relevant code snippet suggestions based on note content",
              parameters: {
                type: "object",
                properties: {
                  snippets: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        language: {
                          type: "string",
                          enum: ["python", "javascript", "java", "cpp", "typescript", "go", "rust"]
                        },
                        code: { type: "string" },
                        description: { type: "string" },
                        relevance: { type: "number", minimum: 60, maximum: 100 }
                      },
                      required: ["language", "code", "description", "relevance"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["snippets"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_code_snippets" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI Gateway responded with ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract snippets from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let snippets = [];
    
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      snippets = args.snippets || [];
    }

    console.log(`Generated ${snippets.length} code snippets`);

    return new Response(
      JSON.stringify({ snippets }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-code-context:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, snippets: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
