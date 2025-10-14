import { useState } from 'react'
import { api } from '../../lib/api'
import Button from '../../components/ui/button'
import Footer from '../../components/footer'
import { Breadcrumb } from '../../components/ui/Breadcrumb'

// Página acessada via /reset-password?token=XYZ
export default function ResetPasswordPage() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== password2) {
      alert('Senhas não conferem')
      return
    }
    setLoading(true)
    try {
      await api.passwordReset(token, password)
      setDone(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao redefinir')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Breadcrumb items={[{ label: 'Redefinir senha' }]} showHome homeHref="/home" className="px-4 pt-2" />
      <main className="flex flex-1 items-center justify-center">
        <div className="bg-readowl-purple-medium p-8 rounded-xl shadow-lg w-[480px] flex flex-col items-center text-white">
          <h1 className="text-2xl font-bold mb-4">Redefinir senha</h1>
          {done ? (
            <div className="flex flex-col items-center gap-2 text-sm">
              <p>Senha alterada com sucesso.</p>
              <a href="/login" className="underline">Ir para login</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <label className="text-sm font-medium" htmlFor="password">Nova senha</label>
              <input
                id="password"
                type="password"
                required
                className="w-full rounded-full px-4 py-2 text-readowl-purple focus:ring-2 focus:ring-readowl-purple-light"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <label className="text-sm font-medium" htmlFor="password2">Confirmar nova senha</label>
              <input
                id="password2"
                type="password"
                required
                className="w-full rounded-full px-4 py-2 text-readowl-purple focus:ring-2 focus:ring-readowl-purple-light"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
              />
              <Button disabled={loading} className="w-40 mx-auto bg-readowl-purple-extralight text-black font-semibold rounded-full text-base py-1">{loading ? 'Salvando...' : 'Redefinir'}</Button>
            </form>
          )}
          <a href="/login" className="text-xs underline mt-4">Voltar ao login</a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
