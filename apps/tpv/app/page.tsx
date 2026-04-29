import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">TPV El Jardin</h1>
      <p className="max-w-xl text-slate-600">
        Proyecto monolito modular en construccion. La web publica ya ofrece carta y menu del dia.
      </p>
      <div className="flex items-center gap-3">
        <Link
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          href="/carta"
        >
          Ir a carta
        </Link>
        <Link
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium"
          href="/menu-dia"
        >
          Ver menu del dia
        </Link>
      </div>
    </div>
  );
}
