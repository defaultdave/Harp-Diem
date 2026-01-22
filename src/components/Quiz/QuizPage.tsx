import { useQuiz } from '../../context'
import { DifficultySelector } from './DifficultySelector'
import { ScoreDisplay } from './ScoreDisplay'
import { AnswerSelector } from './AnswerSelector'
import { QuizControls } from './QuizControls'
import { ResultFeedback } from './ResultFeedback'
import type { Mode } from '../../data/progressions'
import styles from './QuizPage.module.css'

export function QuizPage() {
  const {
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
  } = useQuiz()

  const handleKeyChange = (key: string) => {
    if (userAnswer) {
      setUserAnswer({ ...userAnswer, key })
    }
  }

  const handleModeChange = (mode: Mode) => {
    if (userAnswer) {
      setUserAnswer({ ...userAnswer, mode })
    }
  }

  const isDifficultyDisabled = phase === 'playing' || phase === 'answering'

  return (
    <div className={styles.quizPage}>
      {/* Header Card */}
      <div className={styles.headerCard}>
        <h2 className={styles.title}>Key Quiz</h2>
        <p className={styles.description}>
          Listen to chord progressions and identify the key and mode.
        </p>
      </div>

      {/* Controls Row: Difficulty + Score */}
      <div className={styles.controlsRow}>
        <DifficultySelector
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          disabled={isDifficultyDisabled}
        />
        <ScoreDisplay correct={score.correct} total={score.total} />
      </div>

      {/* Main Quiz Card */}
      <div className={styles.mainCard}>
        {/* Answer Selection (shown during playing, answering, and revealed phases) */}
        {(phase === 'playing' || phase === 'answering' || phase === 'revealed') && userAnswer && (
          <AnswerSelector
            selectedKey={userAnswer.key}
            selectedMode={userAnswer.mode}
            onKeyChange={handleKeyChange}
            onModeChange={handleModeChange}
            disabled={phase !== 'answering' || isAudioPlaying}
          />
        )}

        {/* Quiz Controls */}
        <QuizControls
          phase={phase}
          isAudioPlaying={isAudioPlaying}
          onStartQuiz={startQuiz}
          onReplay={replayProgression}
          onCheckAnswer={checkAnswer}
          onNextQuestion={nextQuestion}
        />
      </div>

      {/* Result Feedback (shown in revealed phase) */}
      {phase === 'revealed' && currentQuestion && isCorrect !== null && (
        <ResultFeedback isCorrect={isCorrect} question={currentQuestion} />
      )}
    </div>
  )
}
