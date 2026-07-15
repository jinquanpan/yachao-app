import { createFileRoute } from "@tanstack/react-router";
import { Check, MapPin, Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { ApiFailure } from "@/components/api-state";
import { SkeletonList } from "@/components/page-skeleton";
import { apiRequest, errorMessage, jsonBody, type Address as AddressType } from "@/lib/api";

export const Route = createFileRoute("/address")({ component: Address });
function Address() {
  const client = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const query = useQuery({
    queryKey: ["addresses"],
    queryFn: () => apiRequest<AddressType[]>("/addresses"),
  });
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["addresses"] });
    client.invalidateQueries({ queryKey: ["checkout"] });
  };
  const makeDefault = useMutation({
    mutationFn: (id: string) => apiRequest(`/addresses/${id}/default`, { method: "PUT" }),
    onSuccess: refresh,
  });
  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiRequest("/addresses", { method: "POST", ...jsonBody(body) }),
    onSuccess: () => {
      refresh();
      setAdding(false);
    },
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    create.mutate(data, { onError: (reason) => setError(errorMessage(reason)) });
  };
  return (
    <PhoneShell showNav={false}>
      <TopBar
        title="收货地址"
        back
        right={
          <button
            onClick={() => setAdding(true)}
            className="border-0 bg-transparent text-[11px] text-[#075cff]"
          >
            新增
          </button>
        }
      />
      {query.isLoading ? (
        <SkeletonList />
      ) : query.error ? (
        <ApiFailure error={query.error} retry={() => void query.refetch()} />
      ) : (
        <div className="space-y-3 px-3">
          {query.data?.map((a) => (
            <button
              onClick={() => makeDefault.mutate(a.id)}
              key={a.id}
              className="card flex w-full items-start gap-3 border-0 p-4 text-left"
            >
              <span
                className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full ${a.is_default ? "bg-[#075cff] text-white" : "border border-slate-300"}`}
              >
                {a.is_default && <Check size={12} />}
              </span>
              <span className="flex-1">
                <b className="text-[12px]">
                  {a.consignee} <span className="font-normal text-slate-500">{a.phone}</span>
                </b>
                <small className="mt-1 block text-[9px] leading-5 text-slate-500">
                  <MapPin size={11} className="mr-1 inline" />
                  {a.province}
                  {a.city}
                  {a.district}
                  {a.detail}
                </small>
              </span>
              {a.tag && (
                <em className="rounded bg-blue-50 px-2 py-1 text-[8px] not-italic text-[#075cff]">
                  {a.tag}
                </em>
              )}
            </button>
          ))}
          <button
            onClick={() => setAdding(true)}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-slate-300 bg-transparent text-[11px] text-slate-500"
          >
            <Plus size={15} />
            新增收货地址
          </button>
        </div>
      )}
      {adding && (
        <div className="absolute inset-0 z-50 overflow-y-auto bg-slate-950/50 p-5">
          <form onSubmit={submit} className="mt-14 space-y-3 rounded-[20px] bg-white p-5">
            <div className="flex items-center justify-between">
              <b className="text-[14px]">新增地址</b>
              <button type="button" onClick={() => setAdding(false)} className="icon-button">
                <X size={17} />
              </button>
            </div>
            {[
              ["consignee", "收货人"],
              ["phone", "手机号"],
              ["province", "省份"],
              ["city", "城市"],
              ["district", "区县"],
              ["detail", "详细地址"],
              ["tag", "标签（可选）"],
            ].map(([name, label]) => (
              <input
                key={name}
                name={name}
                required={name !== "tag"}
                placeholder={label}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-[11px] outline-none"
              />
            ))}
            {error && <p className="text-[10px] text-red-500">{error}</p>}
            <button disabled={create.isPending} className="primary-button w-full">
              保存地址
            </button>
          </form>
        </div>
      )}
    </PhoneShell>
  );
}
