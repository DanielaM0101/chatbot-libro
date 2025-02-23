'use client'

import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { RotateCw, Send, MessageCircle, Trash2, History, BarChart2, Volume2 } from 'lucide-react'
import VideoPlayer from './components/VideoPlayer'
import ReactMarkdown from 'react-markdown'
import DashboardPanel from './components/DashboardPanel'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface HistoryItem {
  question: string
  answer: string
  timestamp: number
  videoId: string | null
  category: string
}

interface Stats {
  totalQuestions: number
  totalResponses: number
  questionsByCategory: Array<{ name: string; value: number }>
}

const HISTORY_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [videoId, setVideoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isHistoryVisible, setIsHistoryVisible] = useState(false)
  const preguntaRealizada = messages.some((message) => message.role === 'user')
  const [isDashboardVisible, setIsDashboardVisible] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 0,
    totalResponses: 0,
    questionsByCategory: [],
  })
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true) 
  const [lastScrollY, setLastScrollY] = useState(0) 

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY) {
        
        setIsHeaderVisible(false)
      } else {
        
        setIsHeaderVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  useEffect(() => {
    const storedHistory = localStorage.getItem('chatHistory')
    const storedStats = localStorage.getItem('chatStats')
    if (storedHistory) {
      try {
        const parsedHistory: HistoryItem[] = JSON.parse(storedHistory)
        const now = Date.now()
        const filteredHistory = parsedHistory.filter((item) => now - item.timestamp <= HISTORY_EXPIRATION_TIME)
        setHistory(filteredHistory)
      } catch (e) {
        console.error('Error al cargar historial:', e)
      }
    }

    if (storedStats) {
      try {
        const parsedStats = JSON.parse(storedStats)
        setStats(parsedStats)
      } catch (e) {
        console.error('Error al cargar estadísticas:', e)
      }
    }

    setMessages([{ role: 'assistant', content: 'Hola, soy Bermal. Tu asistente médico personal. ¿En qué puedo ayudarte hoy?' }])
    loadVoices()
  }, [])

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem('chatStats', JSON.stringify(stats))
  }, [stats])

  const loadVoices = () => {
    const voices = window.speechSynthesis.getVoices()
    const selected = voices.find(voice => voice.name === 'Google español de Estados Unidos')
    setSelectedVoice(selected || voices[0])
  }

  const speakText = (text: string) => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause()
      setIsPaused(true)
      return
    }

    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      return
    }

    window.speechSynthesis.cancel()
    const cleanedText = text.replace(/[.,[\]#]/g, '')
    const utterance = new SpeechSynthesisUtterance(cleanedText)
    utterance.lang = 'es-ES'
    utterance.rate = 0.8
    utterance.pitch = 1.0
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      setCurrentUtterance(null)
      setIsPaused(false)
    }
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
    setCurrentUtterance(utterance)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
  
    const userMessage: Message = { role: 'user', content: input }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput('')
    setError(null)
    setIsLoading(true)
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        throw new Error(data.error || 'Error en la respuesta del servidor')
      }
  
      const category = determineCategory(input, data.content)
      const relatedToFirstAid = category !== 'Otros'
  
      
      const validVideoId = data.videoId && data.videoId !== "NULL" && data.videoId !== "EMPTY"
      setVideoId(relatedToFirstAid && validVideoId ? data.videoId : null)
  
      setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: data.content }])
  
      updateStats(input, data.content)
  
      const now = Date.now()
      setHistory((prevHistory) => [
        ...prevHistory.filter((item) => now - item.timestamp <= HISTORY_EXPIRATION_TIME),
        {
          question: input,
          answer: data.content,
          timestamp: now,
          videoId: relatedToFirstAid && validVideoId ? data.videoId : null,
          category: category,
        },
      ])
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const updateStats = (newQuestion: string, newAnswer: string) => {
    setStats((prevStats) => {
      const totalQuestions = prevStats.totalQuestions + 1
      const totalResponses = prevStats.totalResponses + 1

      const category = determineCategory(newQuestion, newAnswer)

      const updatedQuestionsByCategory = [...prevStats.questionsByCategory]
      const categoryIndex = updatedQuestionsByCategory.findIndex((item) => item.name === category)
      if (categoryIndex !== -1) {
        updatedQuestionsByCategory[categoryIndex].value += 1
      } else {
        updatedQuestionsByCategory.push({ name: category, value: 1 })
      }

      return {
        totalQuestions,
        totalResponses,
        questionsByCategory: updatedQuestionsByCategory,
      }
    })
  }

  const determineCategory = (question: string, answer: string) => {
    const combinedText = (question + ' ' + answer).toLowerCase()
    if (combinedText.includes('herida') || combinedText.includes('corte')) return 'Heridas'
    if (combinedText.includes('quemadura')) return 'Quemaduras'
    if (combinedText.includes('fractura') || combinedText.includes('hueso')) return 'Fracturas'
    if (combinedText.includes('rcp') || combinedText.includes('reanimación')) return 'RCP'
    if (combinedText.includes('mordeduras')) return 'Mordeduras'
    if (combinedText.includes('atragantamiento')) return 'Atragantamiento'
    if (combinedText.includes('cortes')) return 'Cortes'
    return 'Otros'
  }

  const normalizeCategory = (category: string) => {
    return category.toLowerCase().replace(/\s+/g, '');
  };
  
  const updateStatsOnDelete = (item: HistoryItem) => {
    setStats((prevStats) => {
      const totalQuestions = prevStats.totalQuestions - 1;
      const totalResponses = prevStats.totalResponses - 1;

      const normalizedCategory = normalizeCategory(item.category);
      const updatedQuestionsByCategory = prevStats.questionsByCategory.filter((cat) => normalizeCategory(cat.name) !== normalizedCategory || cat.value > 1);

      const categoryIndex = updatedQuestionsByCategory.findIndex((cat) => normalizeCategory(cat.name) === normalizedCategory);
      if (categoryIndex !== -1) {
        updatedQuestionsByCategory[categoryIndex].value -= 1;
      }

      return {
        totalQuestions,
        totalResponses,
        questionsByCategory: updatedQuestionsByCategory,
      };
    });
  };
  

  const handleDeleteHistoryItem = (index: number) => {
    const itemToDelete = history[index]
    setHistory((prevHistory) => prevHistory.filter((_, i) => i !== index))
    updateStatsOnDelete(itemToDelete)
  }

  const handleClearChat = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setCurrentUtterance(null)
    setIsPaused(false)
    setMessages([{ role: 'assistant', content: 'Hola, soy Bermal. Tu asistente médico personal. ¿En qué puedo ayudarte hoy?' }])
    setVideoId(null)
  }

  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible)
  }

  const toggleDashboard = () => {
    setIsDashboardVisible((prev) => !prev)
  }

  const handleHistoryClick = (item: HistoryItem) => {
    setMessages([{ role: 'user', content: item.question }, { role: 'assistant', content: item.answer }])
    setVideoId(item.videoId || null)
    setIsHistoryVisible(false)
  }


return (
  <div className="min-h-screen bg-blue-100">
    {}
    <header className={`bg-white shadow-md p-2 sm:p-4 sticky top-0 z-50 transition-transform duration-300 ${isHeaderVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto">
        {}
        <div className="flex flex-col gap-3 sm:hidden">
          <div className="flex items-center justify-between">
            <img src="imagenes/tec-logo.jpg" alt="TEC Logo" className="h-10 w-auto" />
            <Button
              onClick={toggleDashboard}
              className="bg-[#329fda] hover:bg-[#0077BE] text-white rounded-full shadow-md"
            >
              <BarChart2 className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleClearChat}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md flex items-center gap-1 text-sm px-3"
            >
              <Trash2 className="w-4 h-4" />
              Borrar
            </Button>
            <Button
              onClick={toggleHistory}
              className="bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-md flex items-center gap-1 text-sm px-3"
            >
              <History className="w-4 h-4" />
              Historial
            </Button>
          </div>
        </div>

        {}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src="imagenes/tec-logo.jpg" alt="TEC Logo" className="h-14 w-auto" />
            <div className="h-8 w-px bg-gray-200" />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleClearChat}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Borrar Chat
            </Button>
            <Button
              onClick={toggleHistory}
              className="bg-gray-500 hover:bg-gray-600 text-white rounded-full shadow-md flex items-center gap-2"
            >
              <History className="w-5 h-5" />
              Historial
            </Button>
            <Button
              onClick={toggleDashboard}
              className="bg-[#329fda] hover:bg-[#0077BE] text-white rounded-full shadow-md flex items-center gap-2"
            >
              <BarChart2 className="w-5 h-5" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </header>

    <main className="max-w-7xl mx-auto p-2 sm:p-4">
      {isDashboardVisible ? (
        <>
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#329fda]">Panel de Control</h2>
              <p className="text-sm sm:text-base text-gray-600">Estadísticas del sistema de ayuda</p>
              <img src="/imagenes/bermal-logo.png" alt="Bermal" className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <Button
              onClick={toggleDashboard}
              className="bg-[#329fda] hover:bg-[#0077BE] text-white rounded-full shadow-md flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Regresar al Chatbot
            </Button>
          </div>
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <DashboardPanel {...stats} />
          </div>
        </>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {}
          <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-[#329fda] p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <img src="/imagenes/bermal-logo.png" alt="Bermal Icon" className="w-6 h-6 sm:w-8 sm:h-8" />
                <h2 className="text-white font-medium text-base sm:text-lg">Ayuda Bermal</h2>
              </div>
            </div>

            <div className="p-2 sm:p-4 flex flex-col h-[500px] sm:h-[700px]">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-[#329fda]/10 p-2 rounded-xl">
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#329fda]" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Conversación</h3>
              </div>

              {}
              <div className="flex-1 overflow-auto mb-4 space-y-3 sm:space-y-4 p-2 sm:p-4">
                {messages.map((m, index) => (
                  <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-xl sm:rounded-2xl ${m.role === 'user' ? 'bg-[#329fda] text-white' : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {m.role === 'user' ? (
                        m.content
                      ) : (
                        <ReactMarkdown className="prose prose-sm max-w-none text-sm sm:text-base">{m.content}</ReactMarkdown>
                      )}
                    </div>
                    {m.role === 'assistant' && (
                      <Button
                        onClick={() => speakText(m.content)}
                        className="ml-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1 sm:px-2 shadow-md"
                      >
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                      </Button>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-[#329fda] p-2 sm:p-3">
                    <RotateCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="font-medium text-sm sm:text-base">Generando respuesta...</span>
                  </div>
                )}
              </div>

              {}
              <form onSubmit={handleSubmit} className="p-2 sm:p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
                <div className="flex gap-2 bg-white p-2 sm:p-3 rounded-full shadow-md">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu pregunta aquí..."
                    className="flex-1 border-0 bg-transparent focus:ring-0 placeholder-gray-900 text-gray-900 text-sm sm:text-base"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#329fda] hover:bg-[#0077BE] text-white rounded-full px-3 sm:px-4 shadow-md"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {}
          <div className="lg:w-[600px] bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-[#329fda] p-3 sm:p-4">
              <h2 className="text-white font-medium text-base sm:text-lg">Video Demostrativo</h2>
            </div>
            <div className="p-2 sm:p-4">
              {videoId && videoId !== "NULL" && videoId !== "EMPTY" ? (
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                  <VideoPlayer videoId={videoId} />
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl text-gray-500 bg-gray-50">
                  <img src="/imagenes/bermal-logo.png" alt="Bermal Logo" className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-50" />
                  <p className="text-center text-sm sm:text-base">
                    {preguntaRealizada ? "No hay video demostrativo disponible para este tema." : "Haz una pregunta para ver un video relacionado."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>

    {}
    {isHistoryVisible && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[90%] sm:max-w-md max-h-[80vh] overflow-y-auto shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Preguntas</h2>
          <ul className="space-y-3 sm:space-y-4">
            {history.map((item, index) => (
              <li
                key={index}
                className="cursor-pointer hover:bg-gray-100 p-2 sm:p-3 rounded-lg transition-colors"
                onClick={() => handleHistoryClick(item)}
              >
                <div className="flex justify-between items-center">
                  <div className="text-xs sm:text-sm font-medium text-gray-700">{item.question}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteHistoryItem(index)
                    }}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <Button onClick={toggleHistory} className="mt-4 bg-[#329fda] hover:bg-[#0077BE] text-white w-full shadow-md">
            Cerrar
          </Button>
        </div>
      </div>
    )}
  </div>
  );
}

