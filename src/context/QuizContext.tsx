/**
 * Context for managing key identification quiz state.
 * @packageDocumentation
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { generateQuestion, type QuizQuestion, type Difficulty, type Mode } from '../data'
import { playChordProgression } from '../utils'

export type QuizPhase = 'idle' | 'playing' | 'answering' | 'revealed'

interface UserAnswer {
  key: string
  mode: Mode
}

interface Score {
  correct: number
  total: number
}

interface QuizState {
  phase: QuizPhase
  difficulty: Difficulty
  currentQuestion: QuizQuestion | null
  userAnswer: UserAnswer | null
  isCorrect: boolean | null
  score: Score
  isAudioPlaying: boolean
}

interface QuizContextValue extends QuizState {
  setDifficulty: (difficulty: Difficulty) => void
  setUserAnswer: (answer: UserAnswer) => void
  startQuiz: () => Promise<void>
  checkAnswer: () => void
  nextQuestion: () => Promise<void>
  replayProgression: () => Promise<void>
}

const QuizContext = createContext<QuizContextValue | null>(null)

interface QuizProviderProps {
  children: ReactNode
}

/** Provider for quiz state management (question generation, scoring, audio playback). */
export function QuizProvider({ children }: QuizProviderProps) {
  const [phase, setPhase] = useState<QuizPhase>('idle')
  const [difficulty, setDifficultyState] = useState<Difficulty>('easy')
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null)
  const [userAnswer, setUserAnswerState] = useState<UserAnswer | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 })
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const isAudioPlayingRef = useRef(false)

  const setDifficulty = useCallback((newDifficulty: Difficulty) => {
    if (phase === 'idle' || phase === 'revealed') {
      setDifficultyState(newDifficulty)
    }
  }, [phase])

  const setUserAnswer = useCallback((answer: UserAnswer) => {
    if (phase === 'answering') {
      setUserAnswerState(answer)
    }
  }, [phase])

  const playCurrentProgression = useCallback(async (question: QuizQuestion) => {
    if (isAudioPlayingRef.current) return

    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    isAudioPlayingRef.current = true
    setIsAudioPlaying(true)

    try {
      await playChordProgression(
        question.progression,
        { chordDuration: 1.2, arpeggiate: true },
        abortControllerRef.current.signal
      )
    } catch {
      // Playback was aborted or errored
    } finally {
      isAudioPlayingRef.current = false
      setIsAudioPlaying(false)
      abortControllerRef.current = null
    }
  }, [])

  const startQuiz = useCallback(async () => {
    if (phase !== 'idle' && phase !== 'revealed') return

    const question = generateQuestion(difficulty)
    setCurrentQuestion(question)
    setUserAnswerState({ key: 'C', mode: 'major' })
    setIsCorrect(null)
    setPhase('playing')

    await playCurrentProgression(question)

    setPhase('answering')
  }, [phase, difficulty, playCurrentProgression])

  const checkAnswer = useCallback(() => {
    if (phase !== 'answering' || !currentQuestion || !userAnswer) return

    const correct =
      userAnswer.key === currentQuestion.key &&
      userAnswer.mode === currentQuestion.mode

    setIsCorrect(correct)
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
    setPhase('revealed')
  }, [phase, currentQuestion, userAnswer])

  const nextQuestion = useCallback(async () => {
    if (phase !== 'revealed') return

    const question = generateQuestion(difficulty)
    setCurrentQuestion(question)
    setUserAnswerState({ key: 'C', mode: 'major' })
    setIsCorrect(null)
    setPhase('playing')

    await playCurrentProgression(question)

    setPhase('answering')
  }, [phase, difficulty, playCurrentProgression])

  const replayProgression = useCallback(async () => {
    if (!currentQuestion || (phase !== 'answering' && phase !== 'revealed')) return
    await playCurrentProgression(currentQuestion)
  }, [currentQuestion, phase, playCurrentProgression])

  return (
    <QuizContext.Provider
      value={{
        phase,
        difficulty,
        currentQuestion,
        userAnswer,
        isCorrect,
        score,
        isAudioPlaying,
        setDifficulty,
        setUserAnswer,
        startQuiz,
        checkAnswer,
        nextQuestion,
        replayProgression,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

/** Hook to access quiz state. Must be used within QuizProvider. */
export function useQuiz(): QuizContextValue {
  const context = useContext(QuizContext)
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider')
  }
  return context
}
