import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MockLogin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("http://localhost:3333/users");
        const data = await res.json();
        if (!cancelled) setUsers(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (user: any) => {
    try {
      const res = await fetch("http://localhost:3333/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: user.password }),
      });
      if (!res.ok) {
        // fallback to mock token
        localStorage.setItem("readowl-token", "mock-token-" + user.id);
        localStorage.setItem("readowl-user-id", user.id);
        navigate("/create");
        return;
      }
      const data = await res.json();
      // json-server-auth returns { accessToken, user }
      localStorage.setItem(
        "readowl-token",
        data.accessToken || "mock-token-" + user.id
      );
      localStorage.setItem("readowl-user-id", data.user?.id || user.id);
      navigate("/create");
    } catch (e) {
      // fallback
      localStorage.setItem("readowl-token", "mock-token-" + user.id);
      localStorage.setItem("readowl-user-id", user.id);
      navigate("/create");
    }
  };

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Mock Login (para testes)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((u) => (
          <div key={u.id} className="p-4 border rounded bg-white/90">
            <div className="font-medium">{u.nome || u.email}</div>
            <div className="text-sm text-slate-600">{u.email}</div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => login(u)}
                className="px-3 py-1 bg-readowl-purple-light text-white rounded"
              >
                Login como
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
