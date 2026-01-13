import { memo } from 'react'
import type { HoleNote } from '../data/harmonicas'
import { isNoteInScale, getNoteDegree, degreeToRoman } from '../data/scales'
import { playTone } from '../utils/audioPlayer'
import styles from './HoleColumn.module.css'

interface NoteSectionProps {
  label: string
  note: string
  frequency: number
  isPlayable: boolean
  showDegrees: boolean
  scaleNotes: string[]
}

const NoteSection = ({ label, note, frequency, isPlayable, showDegrees, scaleNotes }: NoteSectionProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      playTone(frequency)
    }
  }

  const degree = showDegrees && isPlayable ? getNoteDegree(note, scaleNotes) : undefined
  const romanNumeral = degree ? degreeToRoman(degree) : undefined

  return (
    <div
      className={`${styles.noteSection} ${isPlayable ? styles.playable : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => playTone(frequency)}
      onKeyDown={handleKeyDown}
      aria-label={`${label} ${note}${romanNumeral ? ` (degree ${romanNumeral})` : ''}${isPlayable ? ', in scale' : ', not in scale'}. Press to play.`}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.noteDisplay}>
        {romanNumeral && <div className={styles.degree}>{romanNumeral}</div>}
        <div className={styles.note}>{note}</div>
      </div>
    </div>
  )
}

interface HoleColumnProps {
  hole: HoleNote
  scaleNotes: string[]
  isBlowPlayable: boolean
  isDrawPlayable: boolean
  showDegrees: boolean
}

export const HoleColumn = memo(function HoleColumn({
  hole,
  scaleNotes,
  isBlowPlayable,
  isDrawPlayable,
  showDegrees,
}: HoleColumnProps) {
  const isOverblowPlayable = hole.overblow && isNoteInScale(hole.overblow.note, scaleNotes)
  const isBlowWholeStepPlayable =
    hole.blowBends?.wholeStepBend && isNoteInScale(hole.blowBends.wholeStepBend.note, scaleNotes)
  const isBlowHalfStepPlayable =
    hole.blowBends?.halfStepBend && isNoteInScale(hole.blowBends.halfStepBend.note, scaleNotes)
  const isDrawHalfStepPlayable =
    hole.drawBends?.halfStepBend && isNoteInScale(hole.drawBends.halfStepBend.note, scaleNotes)
  const isDrawWholeStepPlayable =
    hole.drawBends?.wholeStepBend && isNoteInScale(hole.drawBends.wholeStepBend.note, scaleNotes)
  const isDrawMinorThirdPlayable =
    hole.drawBends?.minorThirdBend && isNoteInScale(hole.drawBends.minorThirdBend.note, scaleNotes)
  const isOverdrawPlayable = hole.overdraw && isNoteInScale(hole.overdraw.note, scaleNotes)

  return (
    <div className={styles.holeColumn}>
      {/* Overblow and Blow Bends - Top */}
      <div className={styles.blowGroup}>
        {hole.overblow && (
          <NoteSection
            label="OB"
            note={hole.overblow.note}
            frequency={hole.overblow.frequency}
            isPlayable={!!isOverblowPlayable}
            showDegrees={showDegrees}
            scaleNotes={scaleNotes}
          />
        )}
        {hole.blowBends?.wholeStepBend && (
          <NoteSection
            label="↑2"
            note={hole.blowBends.wholeStepBend.note}
            frequency={hole.blowBends.wholeStepBend.frequency}
            isPlayable={!!isBlowWholeStepPlayable}
            showDegrees={showDegrees}
            scaleNotes={scaleNotes}
          />
        )}
        {hole.blowBends?.halfStepBend && (
          <NoteSection
            label="↑1"
            note={hole.blowBends.halfStepBend.note}
            frequency={hole.blowBends.halfStepBend.frequency}
            isPlayable={!!isBlowHalfStepPlayable}
            showDegrees={showDegrees}
            scaleNotes={scaleNotes}
          />
        )}
        {/* Blow Note - Middle */}
        <NoteSection
          label="Blow"
          note={hole.blow.note}
          frequency={hole.blow.frequency}
          isPlayable={isBlowPlayable}
          showDegrees={showDegrees}
          scaleNotes={scaleNotes}
        />
      </div>

      {/* Hole Number */}
      <div className={styles.holeNumber}>{hole.hole}</div>

      {/* Draw Bends and Overdraw - Bottom */}
      <div className={styles.drawGroup}>
        {/* Draw Note - Below Blow */}
        <NoteSection
          label="Draw"
          note={hole.draw.note}
          frequency={hole.draw.frequency}
          isPlayable={isDrawPlayable}
          showDegrees={showDegrees}
          scaleNotes={scaleNotes}
        />
        {hole.drawBends?.halfStepBend && (
          <NoteSection
            label="↓1"
            note={hole.drawBends.halfStepBend.note}
            frequency={hole.drawBends.halfStepBend.frequency}
            isPlayable={!!isDrawHalfStepPlayable}
            showDegrees={showDegrees}
            scaleNotes={scaleNotes}
          />
        )}
        {hole.drawBends?.wholeStepBend && (
          <NoteSection
            label="↓2"
            note={hole.drawBends.wholeStepBend.note}
            frequency={hole.drawBends.wholeStepBend.frequency}
            isPlayable={!!isDrawWholeStepPlayable}
            showDegrees={showDegrees}
            scaleNotes={scaleNotes}
          />
        )}
        {hole.drawBends?.minorThirdBend && (
          <NoteSection
            label="↓3"
            note={hole.drawBends.minorThirdBend.note}
            frequency={hole.drawBends.minorThirdBend.frequency}
            isPlayable={!!isDrawMinorThirdPlayable}
            showDegrees={showDegrees}
            scaleNotes={scaleNotes}
          />
        )}
        {hole.overdraw && (
          <NoteSection
            label="OD"
            note={hole.overdraw.note}
            frequency={hole.overdraw.frequency}
            isPlayable={!!isOverdrawPlayable}
            showDegrees={showDegrees}
            scaleNotes={scaleNotes}
          />
        )}
      </div>
    </div>
  )
})
