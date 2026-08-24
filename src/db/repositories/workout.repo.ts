import { db } from '../db'
import type { Exercise, WorkoutDay } from '../models'
import { moveToTrash } from './trash.repo'

export function listWorkoutDays() {
  return db.workoutDays.orderBy('order').toArray()
}

export async function renameWorkoutDay(id: string, label: string): Promise<void> {
  await db.workoutDays.update(id, { label })
}

export function listExercisesByDay(workoutDayId: string) {
  return db.exercises.where('workoutDayId').equals(workoutDayId).sortBy('order')
}

export interface ExerciseInput {
  name: string
  sets: number
  reps: string
  weight: string | null
  notes: string
}

export async function addExercise(workoutDayId: string, input: ExerciseInput): Promise<void> {
  const count = await db.exercises.where('workoutDayId').equals(workoutDayId).count()
  const exercise: Exercise = {
    id: crypto.randomUUID(),
    workoutDayId,
    ...input,
    order: count,
  }
  await db.exercises.add(exercise)
}

export async function updateExercise(id: string, input: Partial<ExerciseInput>): Promise<void> {
  await db.exercises.update(id, input)
}

export async function removeExercise(id: string): Promise<void> {
  const exercise = await db.exercises.get(id)
  if (!exercise) return
  await moveToTrash('exercises', id, exercise.name, exercise)
  await db.exercises.delete(id)
}

export type { WorkoutDay }
