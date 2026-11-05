import { Link, router, usePage } from "@inertiajs/react";
import {
  BookOpen,
  ChartNoAxesCombined,
  ChevronRight,
  Code2,
  House,
  Leaf,
  Moon,
  Music2,
  Piano,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { useI18n } from "../lib/i18n";
import { useProgress } from "../lib/progress";
import type { StudyProps } from "../types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { locale, t, href } = useI18n();
  const { props, url } = usePage<StudyProps>();
  const { progress, storageAvailable } = useProgress();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  const items = [
    { path: "/", key: "nav.overview", icon: House, active: props.view === "overview" },
    {
      path: "/lessons",
      key: "nav.lessons",
      icon: BookOpen,
      active: props.view === "lessons" || props.view === "lesson",
    },
    { path: "/practice", key: "nav.practice", icon: Piano, active: props.view === "practice" },
    { path: "/library", key: "nav.library", icon: Music2, active: props.view === "library" },
    { path: "/harmony", key: "nav.harmony", icon: Piano, active: props.view === "harmony" },
    { path: "/progress", key: "nav.progress", icon: ChartNoAxesCombined, active: props.view === "progress" },
  ];
  const completed = (props.lessons ?? []).filter((lesson) => progress.completed.includes(lesson.id)).length;
  const total = props.lessons?.length ?? 8;
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };
  return (
    <SidebarProvider>
      <a href="#main-content" className="skip-link">
        {t("ui.skip")}
      </a>
      <Sidebar className="border-r" collapsible="offcanvas">
        <SidebarHeader className="px-6 pt-8 pb-9">
          <Link href={href("/")} className="brand flex items-center gap-3" aria-label="Vukem Music">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Music2 size={21} />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              vukem<span className="font-normal text-muted-foreground"> music</span>
              <span className="mt-0.5 block text-[9px] font-medium tracking-[0.22em] text-muted-foreground">
                {t("ui.learning")}
              </span>
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-4">
            <SidebarGroupLabel className="mb-3 px-3 text-[10px] tracking-[0.15em]">
              {t("ui.workspace")}
            </SidebarGroupLabel>
            <nav aria-label={t("ui.navigation")}>
              <SidebarMenu className="gap-1.5">
                {items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.active}
                      className="h-11 rounded-lg px-3 text-sm font-medium"
                    >
                      <Link href={href(item.path)} aria-current={item.active ? "page" : undefined}>
                        <item.icon className="mr-1 size-4" />
                        <span>{t(item.key)}</span>
                        {item.active && <ChevronRight className="ml-auto size-3 opacity-60" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroup>
          <div className="mx-6 mt-9 space-y-3 border-t pt-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t("ui.lessonsCompleted")}</span>
              <span className="font-medium">
                {completed}/{total}
              </span>
            </div>
            <Progress value={(completed / total) * 100} aria-label={t("ui.lessonsCompleted")} className="h-1.5" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">{t("ui.local")}</p>
          </div>
        </SidebarContent>
        <SidebarFooter className="gap-4 px-6 pb-6">
          <div className="rounded-xl border bg-background/60 p-4">
            <Leaf className="mb-3 size-5 text-primary" />
            <p className="text-[9px] font-semibold tracking-widest">{t("ui.dayPractice")}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t("ui.practiceTip")}</p>
          </div>
          <a
            href="https://github.com/AlexGalhardo/vukem-music"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Code2 size={14} />
            {t("ui.github")}
          </a>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-w-0">
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b px-5 md:px-9">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <span className="text-xs text-muted-foreground">
              {t(items.find((item) => item.active)?.key ?? "nav.overview")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <label className="sr-only" htmlFor="locale">
              {t("ui.language")}
            </label>
            <select
              id="locale"
              aria-label={t("ui.language")}
              value={locale}
              onChange={(event) => {
                const next = new URL(url, window.location.origin);
                next.searchParams.set("lang", event.target.value);
                router.visit(next.pathname + next.search, { preserveState: true, preserveScroll: true });
              }}
              className="rounded-md border bg-background px-2 py-1.5 text-xs"
            >
              <option value="en">English</option>
              <option value="pt-BR">Português</option>
            </select>
            <Button type="button" size="icon" variant="ghost" aria-label={t("ui.theme")} onClick={toggleTheme}>
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </Button>
          </div>
        </header>
        <div
          id="main-content"
          className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-8 md:px-9 lg:px-12 lg:py-10"
          tabIndex={-1}
        >
          {children}
        </div>
        <footer className="mx-5 flex flex-wrap justify-between gap-3 border-t py-5 text-[10px] text-muted-foreground md:mx-9">
          <span>© {new Date().getFullYear()} Vukem Music · MIT</span>
          <span>{t("ui.original")}</span>
        </footer>
        {!storageAvailable && (
          <p role="status" className="px-6 pb-4 text-sm text-muted-foreground">
            {t("ui.tryWithoutStorage")}
          </p>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
