import { PatientHeader } from "@/components/patient/patient-header";
import { PublicFooter } from "@/components/shared/public-footer";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PatientHeader />
      <main>{children}</main>
      <PublicFooter />
    </>
  );
}
