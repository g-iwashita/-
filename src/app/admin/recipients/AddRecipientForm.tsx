"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { addRecipientAction, type AddResult } from "./actions";
import styles from "./recipients.module.css";

export function AddRecipientForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<AddResult | null, FormData>(
    addRecipientAction,
    null
  );

  // 追加成功したら入力をクリアし、一覧をリロードなしで更新する
  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className={styles.addForm}>
      <input
        className={`${styles.input} ${styles.emailInput}`}
        type="email"
        name="email"
        placeholder="メールアドレス"
        required
        autoComplete="off"
        disabled={pending}
      />
      <input
        className={`${styles.input} ${styles.labelInput}`}
        type="text"
        name="label"
        placeholder="名前・メモ（任意）"
        disabled={pending}
      />
      <button className={styles.addButton} type="submit" disabled={pending}>
        {pending ? "追加中…" : "追加"}
      </button>

      {state?.error === "invalid" ? (
        <p className={`${styles.message} ${styles.error}`}>メールアドレスの形式が正しくありません。</p>
      ) : null}
      {state?.error === "dup" ? (
        <p className={`${styles.message} ${styles.error}`}>そのメールアドレスはすでに登録されています。</p>
      ) : null}
      {state?.ok ? (
        <p className={`${styles.message} ${styles.success}`}>追加しました。</p>
      ) : null}
    </form>
  );
}
