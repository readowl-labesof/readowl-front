import { useState } from 'react'
import { api } from '../../lib/api'
import Button from '../../components/ui/button'
import Footer from '../../components/footer'
import { Breadcrumb } from '../../components/ui/Breadcrumb'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.passwordForgot(email)
      setSent(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao enviar email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Breadcrumb items={[{ label: 'Esqueci a senha' }]} showHome homeHref="/home" className="px-4 pt-2" />
      <main className="flex flex-1 items-center justify-center">
        <div className="bg-readowl-purple-medium p-8 rounded-xl shadow-lg w-[480px] flex flex-col items-center text-white">
          <h1 className="text-2xl font-bold mb-4">Recuperar senha</h1>
          {sent ? (
            <p className="text-sm text-center">Se o email existir, enviamos um link de recuperação.</p>
          ) : (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                className="w-full rounded-full px-4 py-2 text-readowl-purple focus:ring-2 focus:ring-readowl-purple-light"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <Button disabled={loading} className="w-40 mx-auto bg-readowl-purple-extralight text-black font-semibold rounded-full text-base py-1">{loading ? 'Enviando...' : 'Enviar'}</Button>
            </form>
          )}
          <a href="/login" className="text-xs underline mt-4">Voltar ao login</a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
