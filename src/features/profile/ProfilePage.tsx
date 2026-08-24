import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { BackHeader } from '@/components/layout/BackHeader'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { ImagePicker } from '@/components/ui/ImagePicker'
import { getProfile, updateProfile } from '@/db/repositories/profile.repo'

export function ProfilePage() {
  const profile = useLiveQuery(() => getProfile(), [])
  const [displayName, setDisplayName] = useState('')
  const [nickname, setNickname] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.displayName)
    setNickname(profile.nickname)
    setPhoto(profile.photoBase64)
  }, [profile])

  const handleSave = async () => {
    await updateProfile({ displayName: displayName.trim(), nickname: nickname.trim(), photoBase64: photo })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      <BackHeader title="Mais" to="/mais" />
      <PageHeader title="Perfil" />

      <Card className="flex flex-col gap-4 p-4">
        <ImagePicker value={photo} onChange={setPhoto} shape="circle" size={96} />
        <TextField label="Nome" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Seu nome" />
        <TextField label="Apelido" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Como quer ser chamado" />
        <div className="flex items-center gap-3">
          <Button onClick={() => void handleSave()}>Salvar</Button>
          {saved && <span className="text-sm text-[var(--success)]">Salvo!</span>}
        </div>
      </Card>
    </div>
  )
}
