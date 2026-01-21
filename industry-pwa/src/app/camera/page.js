'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Camera() {
  const router = useRouter()

  const upload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('Not logged in')

    const filePath = `${user.id}/${Date.now()}.jpg`

    const { error } = await supabase.storage
      .from('photos')
      .upload(filePath, file)

    if (error) return alert(error.message)

    const { data } = supabase
      .storage
      .from('photos')
      .getPublicUrl(filePath)

    await supabase.from('photos').insert({
      user_id: user.id,
      url: data.publicUrl
    })

    router.push('/home')
  }

  return (
    <input
      type="file"
      accept="image/*"
      capture="environment"
      onChange={upload}
    />
  )
}
