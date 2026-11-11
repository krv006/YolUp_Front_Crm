import { AlertCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/shared/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <AlertCircle className="mb-6 h-12 w-12 text-muted-foreground" />
      <h1 className="text-3xl font-bold text-foreground">Sahifa topilmadi</h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        Siz qidirdiysa sahifa bazada topilmadi yoki yo‘qolgan.
      </p>
      <div className="mt-8">
        <Button
          onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            void navigate({ to: "/" });
          }}
        >
          Bosh sahifaga qaytish
        </Button>
      </div>
    </div>
  );
}
