import * as Icons from 'lucide-react'

// Helper para mapear nomes antigos para novos, se necessário no futuro
export const legacyIconMap: Record<string, keyof typeof Icons> = {
  home: 'Home',
  search: 'Search',
  book: 'BookOpen',
  user: 'User',
  star: 'Star',
  login: 'LogIn',
  logout: 'LogOut',
  edit: 'Pencil',
  delete: 'Trash2',
  plus: 'Plus',
}
