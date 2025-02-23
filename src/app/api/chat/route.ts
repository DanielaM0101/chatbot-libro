import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'
import { Configuration, OpenAIApi } from 'openai-edge'
import fuzzysort from 'fuzzysort'

export const runtime = 'edge'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set');
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
  }

  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1].content.toLowerCase()

    
    const { data: bookContent, error } = await supabase
      .from('book_content')
      .select('*')

    if (error) {
      console.error('Error fetching book content:', error)
      return new Response(JSON.stringify({ error: 'Error fetching book content' }), { status: 500 })
    }

    
    let videoId = null
    let relevantContent = ''

    const prepareText = (text: string) => {
      return text.toLowerCase().replace(/[^\w\s]/gi, '').trim();
    }

    const cleanedMessage = prepareText(lastMessage)
    

    const searchableContent = bookContent.map(topic => ({
      topic: topic.topic,
      content: topic.content,
      keywords: topic.keywords,
      videoId: topic.video_id,
      searchString: `${topic.topic} ${topic.content} ${topic.keywords.join(' ')}`
    }))

    const searchResults = fuzzysort.go(cleanedMessage, searchableContent, {
      key: 'searchString',
      threshold: -10000,
      limit: 5
    })

    

    for (const result of searchResults) {
      const topic = result.obj
      
      relevantContent += `${topic.topic}:\n${topic.content}\n\n`
      
      if (!videoId && topic.videoId && topic.videoId !== 'NULL' && topic.videoId !== 'EMPTY') {
        videoId = topic.videoId
        
      }
    }

    if (!relevantContent) {
      
      relevantContent = bookContent.map(topic => `${topic.topic}:\n${topic.content}\n\n`).join('')
    }

    
    const systemMessage = `Eres un asistente experto en primeros auxilios basado en el libro "Auxilio al Instante: Técnicas de Respuesta Rápida". 

Información disponible del libro:
${relevantContent}

Instrucciones para formatear tu respuesta:
1. Usa Markdown para estructurar tu respuesta.
2. Comienza con un título principal (H1) que resuma el tema.
3. Utiliza subtítulos (H2, H3) para organizar la información en secciones.
4. Usa listas numeradas o con viñetas para enumerar pasos o elementos.
5. Destaca información importante usando negrita o cursiva.
6. Si es apropiado, incluye una cita o nota importante al final usando el formato de cita en Markdown.
7. Mantén la respuesta concisa y fácil de leer.

Instrucciones de contenido:
1. Usa SOLO la información proporcionada arriba para responder a la pregunta del usuario.
2. Si la pregunta no se puede responder completamente con la información proporcionada, indica qué partes puedes responder y qué partes no.
3. NO inventes información que no esté en el contenido proporcionado.
4. Siempre enfatiza la importancia de buscar ayuda profesional en situaciones de emergencia.
5. Si la pregunta no está relacionada con primeros auxilios, indica amablemente que tu conocimiento se limita a ese tema.`

    
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages
      ],
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error from OpenAI API:', response.status, response.statusText, errorData);
      return new Response(JSON.stringify({ error: `Error generating response: ${response.status} ${response.statusText}` }), { status: 500 })
    }

    
    const result = await response.json()
    let aiResponse = result.choices[0]?.message?.content || "Lo siento, no pude generar una respuesta.";

    return NextResponse.json({ 
      content: aiResponse, 
      videoId: videoId
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Unexpected error occurred', details: error instanceof Error ? error.message : String(error) }), { status: 500 })
  }
}



