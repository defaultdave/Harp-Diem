import { memo } from 'react'
import type { HoleNote } from '../data/harmonicas'
import { isNoteInScale, getNoteDegree, degreeToRoman } from '../data/scales'
import { playTone } from '../utils/audioPlayer'
import { getTabNotation, labelToNoteType } from '../utils/tabNotation'
import { useDisplaySettings, usePlayback } from '../context'
import type { NoteNames } from '../types'
import styles from './HoleColumn.module.css'

interface NoteSectionProps {
  label: string
  note: string
  frequency: number
  isPlayable: boolean
  scaleNotes: NoteNames
  holeNumber: number
  isBlow: boolean
  isInChord?: boolean
}

const NoteSection = ({ label, note, frequency, isPlayable, scaleNotes, holeNumber, isBlow, isInChord = false }: NoteSectionProps) => {
  const { showDegrees, noteDisplay } = useDisplaySettings()
  const { isNoteCurrentlyPlaying } = usePlayback()
  const isCurrentlyPlaying = isNoteCurrentlyPlaying(note)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      playTone(frequency)
    }
  }

  const degree = showDegrees && isPlayable ? getNoteDegree(note, scaleNotes) : undefined
  const romanNumeral = degree ? degreeToRoman(degree) : undefined

  const noteType = labelToNoteType(label)
  const tabNotation = getTabNotation(holeNumber, noteType)
  const displayText = noteDisplay === 'tab' ? tabNotation : note

  const breathDirection = isBlow ? styles.blowNote : styles.drawNote

  return (
    <div
      className={`${styles.noteSection} ${isPlayable ? styles.playable : ''} ${isCurrentlyPlaying ? styles.currentlyPlaying : ''} ${isInChord ? styles.inChord : ''} ${breathDirection}`}
      role="button"
      tabIndex={0}
      onClick={() => playTone(frequency)}
      onKeyDown={handleKeyDown}
      aria-label={`${label} ${note}${romanNumeral ? ` (degree ${romanNumeral})` : ''}${isPlayable ? ', in scale' : ', not in scale'}${isInChord ? ', in selected chord' : ''}${isCurrentlyPlaying ? ', currently playing' : ''}. Press to play.`}
    >
      <div className={styles.label}>{label}</div>
      <div className={styles.noteDisplay}>
        {romanNumeral && <div className={styles.degree}>{romanNumeral}</div>}
        <div className={styles.note}>{displayText}</div>
      </div>
    </div>
  )
}

interface HoleColumnProps {
  hole: HoleNote
  scaleNotes: NoteNames
  isBlowPlayable: boolean
  isDrawPlayable: boolean
  isBlowInChord?: boolean
  isDrawInChord?: boolean
}

export const HoleColumn = memo(function HoleColumn({
  hole,
  scaleNotes,
  isBlowPlayable,
  isDrawPlayable,
  isBlowInChord = false,
  isDrawInChord = false,
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
            scaleNotes={scaleNotes}
            holeNumber={hole.hole}
            isBlow={true}
          />
        )}
        {hole.blowBends?.wholeStepBend && (
          <NoteSection
            label="↑2"
            note={hole.blowBends.wholeStepBend.note}
            frequency={hole.blowBends.wholeStepBend.frequency}
            isPlayable={!!isBlowWholeStepPlayable}
            scaleNotes={scaleNotes}
            holeNumber={hole.hole}
            isBlow={true}
          />
        )}
        {hole.blowBends?.halfStepBend && (
          <NoteSection
            label="↑1"
            note={hole.blowBends.halfStepBend.note}
            frequency={hole.blowBends.halfStepBend.frequency}
            isPlayable={!!isBlowHalfStepPlayable}
            scaleNotes={scaleNotes}
            holeNumber={hole.hole}
            isBlow={true}
          />
        )}
        {/* Blow Note - Middle */}
        <NoteSection
          label="Blow"
          note={hole.blow.note}
          frequency={hole.blow.frequency}
          isPlayable={isBlowPlayable}
          scaleNotes={scaleNotes}
          holeNumber={hole.hole}
          isBlow={true}
          isInChord={isBlowInChord}
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
          scaleNotes={scaleNotes}
          holeNumber={hole.hole}
          isBlow={false}
          isInChord={isDrawInChord}
        />
        {hole.drawBends?.halfStepBend && (
          <NoteSection
            label="↓1"
            note={hole.drawBends.halfStepBend.note}
            frequency={hole.drawBends.halfStepBend.frequency}
            isPlayable={!!isDrawHalfStepPlayable}
            scaleNotes={scaleNotes}
            holeNumber={hole.hole}
            isBlow={false}
          />
        )}
        {hole.drawBends?.wholeStepBend && (
          <NoteSection
            label="↓2"
            note={hole.drawBends.wholeStepBend.note}
            frequency={hole.drawBends.wholeStepBend.frequency}
            isPlayable={!!isDrawWholeStepPlayable}
            scaleNotes={scaleNotes}
            holeNumber={hole.hole}
            isBlow={false}
          />
        )}
        {hole.drawBends?.minorThirdBend && (
          <NoteSection
            label="↓3"
            note={hole.drawBends.minorThirdBend.note}
            frequency={hole.drawBends.minorThirdBend.frequency}
            isPlayable={!!isDrawMinorThirdPlayable}
            scaleNotes={scaleNotes}
            holeNumber={hole.hole}
            isBlow={false}
          />
        )}
        {hole.overdraw && (
          <NoteSection
            label="OD"
            note={hole.overdraw.note}
            frequency={hole.overdraw.frequency}
            isPlayable={!!isOverdrawPlayable}
            scaleNotes={scaleNotes}
            holeNumber={hole.hole}
            isBlow={false}
          />
        )}
      </div>
    </div>
  )
})
