import type { QuizPhase } from '../../context'
import styles from './QuizPage.module.css'

interface QuizControlsProps {
  phase: QuizPhase
  isAudioPlaying: boolean
  onStartQuiz: () => void
  onReplay: () => void
  onCheckAnswer: () => void
  onNextQuestion: () => void
}

export function QuizControls({
  phase,
  isAudioPlaying,
  onStartQuiz,
  onReplay,
  onCheckAnswer,
  onNextQuestion,
}: QuizControlsProps) {
  // Idle phase - show Start Quiz button
  if (phase === 'idle') {
    return (
      <div className={styles.controlsSection}>
        <button className={styles.primaryButton} onClick={onStartQuiz}>
          <span aria-hidden="true">&#9654;</span> Start Quiz
        </button>
      </div>
    )
  }

  // Playing or Answering phase - show Replay and Check Answer buttons
  if (phase === 'playing' || phase === 'answering') {
    return (
      <div className={styles.controlsSection}>
        <button
          className={styles.secondaryButton}
          onClick={onReplay}
          disabled={isAudioPlaying}
          aria-describedby={isAudioPlaying ? 'playing-status' : undefined}
        >
          <span aria-hidden="true">&#128260;</span> Replay
        </button>
        <button
          className={styles.primaryButton}
          onClick={onCheckAnswer}
          disabled={isAudioPlaying}
        >
          <span aria-hidden="true">&#10003;</span> Check Answer
        </button>
        {isAudioPlaying && (
          <span id="playing-status" className="sr-only">
            Audio is currently playing
          </span>
        )}
      </div>
    )
  }

  // Revealed phase - show Next Question button
  if (phase === 'revealed') {
    return (
      <div className={styles.controlsSection}>
        <button className={styles.primaryButton} onClick={onNextQuestion}>
          <span aria-hidden="true">&#8594;</span> Next Question
        </button>
      </div>
    )
  }

  return null
}
