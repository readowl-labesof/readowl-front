import { useEffect, useState } from "react";
import Footer from "../../components/footer";
import NavbarProfile from "./navbarprofile";
import ProfileCard from "./profilecard";

function Profile() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("readowl-user") || "null");
    console.log("Profile page - usuário lido do localStorage:", usuario);
    setUser(usuario);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <NavbarProfile />
      <main className="flex-1">

      <ProfileCard user={user} />
        
        
        </main>
      <Footer />
    </div>
  );
}

export default Profile;
