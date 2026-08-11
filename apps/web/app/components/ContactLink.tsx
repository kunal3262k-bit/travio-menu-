import Link from "next/link";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/site-config";

export default function ContactLink({ className = "" }: { className?: string }) {
  if (SUPPORT_WHATSAPP) {
    const digits = SUPPORT_WHATSAPP.replace(/[^0-9]/g, "");
    if (digits) {
      return (
        <Link href={`https://wa.me/${digits}`} className={className}>
          WhatsApp us
        </Link>
      );
    }
  }
  if (SUPPORT_EMAIL) {
    return (
      <Link href={`mailto:${SUPPORT_EMAIL}`} className={className}>
        Contact us
      </Link>
    );
  }
  return null;
}
