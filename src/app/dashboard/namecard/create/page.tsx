import { Metadata } from "next";
import { CardForm } from "../../../../components/namecard/card-form";

export const metadata: Metadata = {
  title: "Create Name Card",
  description: "Create a new digital name card",
};

export default function CreateNameCardPage() {
  return <CardForm />;
}
