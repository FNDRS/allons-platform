import { Button } from "@/components/ui/Button";

/** Takes the place of a pay or reserve button while payments are paused. */
export function PaymentsPausedButton({
  size = "lg",
  className = "",
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <Button size={size} variant="secondary" disabled className={className}>
      Pagos pausados
    </Button>
  );
}
