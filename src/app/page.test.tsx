import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ChatBot from './page'

// Mockear localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
  removeItem: vi.fn(),
}

describe('ChatBot', () => {
  beforeEach(() => {
    // Limpia cualquier valor almacenado antes de cada prueba
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should save messages to the history', () => {
    render(<ChatBot />)

    const input = screen.getByPlaceholderText('Type your message here...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    fireEvent.change(input, { target: { value: 'Hello, world!' } })
    fireEvent.click(sendButton)

    // Verifica que localStorage.setItem fue llamado correctamente
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'chatHistory',
      JSON.stringify([{ question: 'Hello, world!' }])
    )
  })
})
