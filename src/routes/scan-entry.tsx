import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  CircleDollarSign,
  ImagePlus,
  PackagePlus,
  ScanLine,
  Tags,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { PhoneShell, TopBar } from "@/components/phone-shell";
import { ApiFailure } from "@/components/api-state";
import { PageSkeleton } from "@/components/page-skeleton";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, errorMessage, jsonBody, type Category } from "@/lib/api";

export const Route = createFileRoute("/scan-entry")({ component: ScanEntry });

function ScanEntry() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiRequest<Category[]>("/categories"),
  });
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  if (categories.isLoading)
    return (
      <PhoneShell showNav={false}>
        <PageSkeleton variant="form" />
      </PhoneShell>
    );
  if (categories.error)
    return (
      <PhoneShell showNav={false}>
        <TopBar title="扫描录入" back />
        <ApiFailure error={categories.error} retry={() => void categories.refetch()} />
      </PhoneShell>
    );

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      window.alert("图片不能超过 5MB");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saved) return;
    if (!imageFile) {
      window.alert("请选择商品图片");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const form = new FormData();
      form.append("image", imageFile);
      const uploaded = await apiRequest<{ url: string }>("/uploads/images", {
        method: "POST",
        body: form,
      });
      await apiRequest("/scan/products", {
        method: "POST",
        ...jsonBody({
          barcode: code,
          name: name.trim(),
          price,
          category_id: category,
          cover_image: uploaded.url,
        }),
      });
      setSaved(true);
      timerRef.current = window.setTimeout(() => history.back(), 1100);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PhoneShell showNav={false}>
      <TopBar title="扫描录入" back />
      <form onSubmit={submit} className="px-4">
        <section className="rounded-[20px] bg-[linear-gradient(145deg,#06369f,#075cff)] p-5 text-white shadow-[0_14px_36px_#075cff35]">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/30 bg-white/15">
            <ScanLine size={25} />
          </span>
          <h1 className="mb-1 mt-4 text-[20px] font-black">录入新商品</h1>
          <p className="m-0 text-[10px] leading-5 text-white/65">
            扫描商品条码，或手动填写条码信息
          </p>
        </section>

        <section className="card mt-4 space-y-4 p-4">
          <label className="block text-[10px] font-bold">
            商品条码
            <div className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-[#f4f7fb] px-3">
              <ScanLine size={16} className="text-[#075cff]" />
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
                inputMode="numeric"
                placeholder="请输入或扫描商品条码"
                className="min-w-0 flex-1 border-0 bg-transparent text-[11px] outline-none"
              />
            </div>
          </label>
          <label className="block text-[10px] font-bold">
            商品名称
            <div className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-[#f4f7fb] px-3">
              <PackagePlus size={16} className="text-[#075cff]" />
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="请输入商品名称"
                className="min-w-0 flex-1 border-0 bg-transparent text-[11px] outline-none"
              />
            </div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[10px] font-bold">
              商品价格
              <div className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-[#f4f7fb] px-3">
                <CircleDollarSign size={16} className="shrink-0 text-[#075cff]" />
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  type="number"
                  placeholder="0.00"
                  className="min-w-0 flex-1 border-0 bg-transparent text-[11px] outline-none"
                />
              </div>
            </label>
            <label className="block text-[10px] font-bold">
              商品分类
              <div className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-[#f4f7fb] px-3">
                <Tags size={16} className="shrink-0 text-[#075cff]" />
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  required
                  className="min-w-0 flex-1 border-0 bg-transparent text-[11px] outline-none"
                >
                  <option value="" disabled>
                    请选择
                  </option>
                  {categories.data?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
          <label className="block text-[10px] font-bold">
            商品图片
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={selectImage}
              className="sr-only"
            />
            <span className="mt-2 flex min-h-[92px] cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#b9cef8] bg-blue-50/60 text-[#075cff]">
              {image ? (
                <img src={image} alt="商品图片预览" className="h-[118px] w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-[10px]">
                  <ImagePlus size={24} />
                  选择商品图片（最大 5MB）
                </span>
              )}
            </span>
          </label>
        </section>

        {error && <p className="text-center text-[10px] text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="primary-button mt-5 w-full disabled:opacity-50"
        >
          {submitting ? "正在提交…" : "确认录入"}
        </button>
      </form>
      {saved && (
        <div className="success-toast">
          <CheckCircle2 size={22} className="text-cyan-300" />
          录入成功，正在返回
        </div>
      )}
    </PhoneShell>
  );
}
