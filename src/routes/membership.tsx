import { createFileRoute } from "@tanstack/react-router";
import { Crown, Gift, Sparkles, Star } from "lucide-react";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import mascot from "@/assets/mascot-dragon.jpg";
export const Route = createFileRoute("/membership")({ component: Membership });
function Membership() {
  const benefits = [
    { t: "灵感周礼", i: Gift },
    { t: "积分加倍", i: Star },
    { t: "新品尝鲜", i: Sparkles },
    { t: "生日礼遇", i: Crown },
  ];
  return (
    <PhoneShell showNav={false} dark>
      <TopBar title="会员中心" back dark />
      <div className="px-4">
        <div className="relative h-48 overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#0a2a77,#0875ff)] p-5">
          <p className="m-0 text-[9px] tracking-[.25em] text-cyan-200">SHAN HAI VIP</p>
          <h1 className="mt-3 text-2xl font-black">灵客 · LV.7</h1>
          <p className="text-[10px] text-white/60">山海探索者 · 138 **** 0000</p>
          <img
            src={mascot}
            className="absolute -right-4 bottom-0 h-44 w-36 object-cover mix-blend-screen"
          />
          <div className="absolute bottom-5 left-5 right-5">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <i className="block h-full w-2/3 bg-cyan-300" />
            </div>
            <small className="text-[8px] text-white/60">128 / 200 积分</small>
          </div>
        </div>
        <h2 className="mt-6 text-[12px]">会员权益</h2>
        <div className="grid grid-cols-2 gap-3">
          {benefits.map(({ t, i: Icon }) => (
            <div key={t} className="rounded-[16px] border border-white/10 bg-white/5 p-4">
              <Icon size={19} className="text-cyan-300" />
              <b className="mt-2 block text-[11px]">{t}</b>
              <small className="text-[8px] text-white/50">专属山海会员权益</small>
            </div>
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}
