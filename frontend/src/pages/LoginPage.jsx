import LoginCard from "../components/auth/LoginCard";

export default function LoginPage() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)",
      }}
    >
      <LoginCard />
    </div>
  );
}