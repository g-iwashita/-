"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteRecipientAction } from "./actions";
import styles from "./recipients.module.css";

export function DeleteRecipientButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className={styles.deleteButton}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await deleteRecipientAction(id);
          // リロードなしで一覧を更新
          router.refresh();
        })
      }
    >
      {pending ? "削除中…" : "削除"}
    </button>
  );
}
