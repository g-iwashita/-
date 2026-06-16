"use client";

import { useFormStatus } from "react-dom";
import styles from "./diagnose.module.css";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className={styles.submit} type="submit" disabled={pending} aria-busy={pending}>
      {pending ? "診断中…" : "診断する"}
    </button>
  );
}
