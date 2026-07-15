import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Brand, PhoneShell } from "@/components/phone-shell";
import mascot from "@/assets/mascot-dragon.jpg";
import { apiRequest, errorMessage, jsonBody, setSession } from "@/lib/api";

export const Route = createFileRoute("/")({ component: Login });

function Login() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await apiRequest<{ session: { token: string; expires_at: string } }>(
        "/auth/phone/login",
        { method: "POST", ...jsonBody({ phone, code, platform: "pc" }) },
      );
      setSession(result.session);
      await nav({ to: "/home" });
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  };
  return (
    <PhoneShell showNav={false} dark noPad>
      <div className="relative flex h-full min-h-[600px] flex-col px-4 pb-6 pt-2">
        <div className="flex items-center justify-between">
          <Brand compact light />
          <div className="rounded-full bg-white/10 p-1 text-[9px]">
            <b className="rounded-full bg-white px-2 py-1 text-[#09256f]">中文</b>
            <span className="px-2">EN</span>
          </div>
        </div>
        <div className="login-stage relative mt-4 flex-1 overflow-hidden rounded-[20px] border border-blue-400/30 bg-[linear-gradient(160deg,#07184a,#073ec7_55%,#041541)]">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(#61a6ff33 1px,transparent 1px),linear-gradient(90deg,#61a6ff33 1px,transparent 1px)",
              backgroundSize: "25px 25px",
            }}
          />
          <div className="login-scan" />
          <h1 className="absolute left-4 top-4 z-10 m-0 text-[39px] font-black italic leading-[.88] text-white">
            SHAN
            <br />
            HAI
            <br />
            JING
          </h1>
          <p className="absolute left-4 top-[122px] z-10 text-[9px] font-bold text-white">
            灵感即刻发生
            <br />
            <span className="tracking-[.14em] text-white/50">
              INSPIRATION
              <br />
              HAPPENS NOW
            </span>
          </p>
          <div className="login-mascot" aria-label="山海灵感神兽模型">
            <span className="login-mascot-glow" />
            <img src={mascot} alt="山海灵感神兽" />
          </div>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-2">
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            inputMode="tel"
            pattern="1[0-9]{10}"
            placeholder="手机号"
            className="h-11 w-full rounded-[13px] border border-white/20 bg-white/10 px-4 text-[11px] text-white outline-none placeholder:text-white/40"
          />
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
            placeholder="验证码"
            className="h-11 w-full rounded-[13px] border border-white/20 bg-white/10 px-4 text-[11px] text-white outline-none placeholder:text-white/40"
          />
          <button disabled={loading} className="login-primary w-full disabled:opacity-60">
            {loading ? "正在登录…" : "手机号登录"}
          </button>
          {error && <p className="m-0 text-center text-[9px] text-red-300">{error}</p>}
        </form>
        <p className="mb-0 mt-3 text-center text-[8px] text-white/35">
          登录即代表同意《用户协议》和《隐私政策》
        </p>
      </div>
    </PhoneShell>
  );
}
