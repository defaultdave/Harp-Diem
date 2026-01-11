import { memo } from 'react'
import type { HoleNote } from '../data/harmonicas'
import { isNoteInScale } from '../data/scales'
import { playTone } from '../utils/audioPlayer'

interface NoteSectionProps {
  label: string
  note: string
  frequency: number
  isPlayable: boolean
}

const NoteSection = ({ label, note, frequency, isPlayable }: NoteSectionProps) => (
  <div
    className={`note-section ${isPlayable ? 'playable' : ''}`}
    onClick={() => playTone(frequency)}
  >
    <div className="label">{label}</div>
    <div className="note">{note}</div>
  </div>
)

interface HoleColumnProps {
  hole: HoleNote
  scaleNotes: string[]
  isBlowPlayable: boolean
  isDrawPlayable: boolean
}

export const HoleColumn = memo(function HoleColumn({
  hole,
  scaleNotes,
  isBlowPlayable,
  isDrawPlayable,
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
    <div className="hole-column">
      {/* Overblow and Blow Bends - Top */}
      <div className="note-group blow-group">
        {hole.overblow && (
          <NoteSection
            label="OB"
            note={hole.overblow.note}
            frequency={hole.overblow.frequency}
            isPlayable={!!isOverblowPlayable}
          />
        )}
        {hole.blowBends?.wholeStepBend && (
          <NoteSection
            label="↑2"
            note={hole.blowBends.wholeStepBend.note}
            frequency={hole.blowBends.wholeStepBend.frequency}
            isPlayable={!!isBlowWholeStepPlayable}
          />
        )}
        {hole.blowBends?.halfStepBend && (
          <NoteSection
            label="↑1"
            note={hole.blowBends.halfStepBend.note}
            frequency={hole.blowBends.halfStepBend.frequency}
            isPlayable={!!isBlowHalfStepPlayable}
          />
        )}
        {/* Blow Note - Middle */}
        <NoteSection
          label="Blow"
          note={hole.blow.note}
          frequency={hole.blow.frequency}
          isPlayable={isBlowPlayable}
        />
      </div>

      {/* Hole Number */}
      <div className="hole-number">{hole.hole}</div>

      {/* Draw Bends and Overdraw - Bottom */}
      <div className="note-group draw-group">
        {/* Draw Note - Below Blow */}
        <NoteSection
          label="Draw"
          note={hole.draw.note}
          frequency={hole.draw.frequency}
          isPlayable={isDrawPlayable}
        />
        {hole.drawBends?.halfStepBend && (
          <NoteSection
            label="↓1"
            note={hole.drawBends.halfStepBend.note}
            frequency={hole.drawBends.halfStepBend.frequency}
            isPlayable={!!isDrawHalfStepPlayable}
          />
        )}
        {hole.drawBends?.wholeStepBend && (
          <NoteSection
            label="↓2"
            note={hole.drawBends.wholeStepBend.note}
            frequency={hole.drawBends.wholeStepBend.frequency}
            isPlayable={!!isDrawWholeStepPlayable}
          />
        )}
        {hole.drawBends?.minorThirdBend && (
          <NoteSection
            label="↓3"
            note={hole.drawBends.minorThirdBend.note}
            frequency={hole.drawBends.minorThirdBend.frequency}
            isPlayable={!!isDrawMinorThirdPlayable}
          />
        )}
        {hole.overdraw && (
          <NoteSection
            label="OD"
            note={hole.overdraw.note}
            frequency={hole.overdraw.frequency}
            isPlayable={!!isOverdrawPlayable}
          />
        )}
      </div>
    </div>
  )
})
