import { Head, Link } from "@inertiajs/react";
import { useI18n } from "../lib/i18n";

export default function ErrorPage({ status }: { status: number }) {
  const { t, href } = useI18n();
  return (
    <>
      <Head title={`${status} · Vukem Music`} />
      <section className="py-20 text-center">
        <p className="eyebrow">{status}</p>
        <h1 className="section-title mt-4 text-3xl">{t("ui.errorTitle")}</h1>
        <Link href={href("/")} className="mt-6 inline-block text-primary underline">
          {t("ui.returnHome")}
        </Link>
      </section>
    </>
  );
}
