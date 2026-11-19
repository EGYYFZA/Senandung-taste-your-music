"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <EmptyState title="Ada nada yang terlewat." action={<Button onClick={reset}>Coba lagi</Button>}>
      Halaman belum berhasil dimuat. Coba lagi sebentar, ya.
    </EmptyState>
  );
}
