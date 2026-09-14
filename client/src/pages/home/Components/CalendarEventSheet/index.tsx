import { useEffect, useState } from "react";
import type { CalendarEvent } from "@/@types/calendar.types";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { categories } from "@/styles/colors/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarEventGeneralTab } from "./components/CalendarEventGeneralTab";
import { CalendarEventMetaTab } from "./components/CalendarEventMetaTab";
import { CalendarDays, Info } from "lucide-react";

interface Props {
  open: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
}

export function CalendarEventSheet({ open, event, onClose }: Props) {
  const [form, setForm] = useState<CalendarEvent | null>(null);
  const calendarKey = event?.extendedProps?.calendar ?? "Outros";
  const cat = categories.find((c) => c.key === calendarKey) || categories[0];
  
  useEffect(() => {
    if (event) {
      setForm(structuredClone(event));
    }
  }, [event]);

  if (!form) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-neutral-950 border-neutral-800">
        <SheetHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl
                 transition-all duration-300"
              style={{
                backgroundColor: `${cat.color}15`,
                border: `1px solid ${cat.color}30`,
              }}
            >
              <cat.icon className="h-7 w-7" style={{ color: cat.color }} />
            </div>

            <div className="flex flex-1 flex-col gap-1">
              <SheetTitle className="text-lg font-semibold tracking-tight leading-tight">
                {form.title || "Evento sem título"}
              </SheetTitle>

              <div className="flex items-center gap-2 mt-1">
                <span
                  className="flex items-center gap-2 rounded-full px-3 py-1
                     text-xs font-medium border bg-neutral-900"
                  style={{
                    color: cat.color,
                    borderColor: `${cat.color}40`,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.label}
                </span>
              </div>
            </div>
          </div>

          <SheetDescription className="text-sm text-neutral-400 leading-relaxed">
            Atualize as informações, datas e detalhes relacionados a este
            evento.
          </SheetDescription>
        </SheetHeader>

        <div className="p-2">
          <Tabs defaultValue="geral" className="w-full">
            <TabsList
              className="inline-flex gap-1 p-1 rounded-xl bg-neutral-900 border border-neutral-700 mb-4"
            >              <TabsTrigger
              value="geral"
              className="flex items-center gap-2 py-1 rounded-lg text-sm font-medium text-white transition-colors hover:bg-neutral-800 data-[state=active]:bg-neutral-800 data-[state=active]:border data-[state=active]:border-neutral-600"
            >
                <Info className="w-4 h-4 text-white" />
                <span className="text-white">Dados Gerais</span>
              </TabsTrigger>
              <TabsTrigger
                value="detalhes"
                className="flex items-center gap-2 py-1 rounded-lg text-sm font-medium text-white transition-colors hover:bg-neutral-800 data-[state=active]:bg-neutral-800 data-[state=active]:border data-[state=active]:border-neutral-600"
              >
                <CalendarDays className="w-4 h-4 text-white" />
                <span className="text-white">Detalhes do Evento</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="geral">
              <CalendarEventGeneralTab data={form} />
            </TabsContent>
            <TabsContent value="detalhes">
              <CalendarEventMetaTab data={form} />
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter>

        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
