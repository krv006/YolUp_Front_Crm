export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="text-3xl font-bold text-foreground">Sahifa topilmadi</div>
      <p className="mt-2 text-muted-foreground max-w-md">
        Siz qidirdiysa sahifa bazada topilmadi yoki yo‘qolgan.
      </p>
      <div className="mt-8">
        <button className="text-primary underline">Bosh sahifaga qaytish</button>
      </div>
    </div>
  );
}
