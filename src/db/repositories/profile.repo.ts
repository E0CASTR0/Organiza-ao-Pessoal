import { db } from '../db'

export function getProfile() {
  return db.profile.get('profile')
}

export interface ProfileInput {
  displayName: string
  nickname: string
  photoBase64: string | null
}

export async function updateProfile(input: Partial<ProfileInput>): Promise<void> {
  await db.profile.update('profile', { ...input, updatedAt: new Date().toISOString() })
}
