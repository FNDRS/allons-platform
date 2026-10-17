"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import {
  DONATION_LIMITS,
  donationInfoProblems,
  normalizeDonationInfo,
  type EventDonationInfo,
} from "@/lib/eventDonations";

export interface DonationAccountRow {
  key: string;
  bank: string;
  hnl: string;
  usd: string;
}

export interface DonationLinkRow {
  key: string;
  label: string;
  value: string;
  href: string;
}

let rowSeq = 0;
const rowKey = () => `donation-row-${++rowSeq}`;
const emptyAccount = (): DonationAccountRow => ({ key: rowKey(), bank: "", hnl: "", usd: "" });
const emptyLink = (): DonationLinkRow => ({ key: rowKey(), label: "", value: "", href: "" });

/**
 * Accounts and links to donate straight to a beneficiary, shown on the event
 * page. The money never goes through Allons. Mirrors the admin's
 * DonationInfoField: on sends the cleaned object, off on an event that had
 * one sends null, and otherwise the key is left out.
 */
export function useEventDonationInfo(initial: EventDonationInfo | null | undefined) {
  const [enabled, setEnabled] = useState(Boolean(initial));
  const [beneficiary, setBeneficiary] = useState(initial?.beneficiary ?? "");
  const [accounts, setAccounts] = useState<DonationAccountRow[]>(() =>
    initial?.accounts.length
      ? initial.accounts.map((account) => ({
          key: rowKey(),
          bank: account.bank,
          hnl: account.hnl ?? "",
          usd: account.usd ?? "",
        }))
      : [emptyAccount()],
  );
  const [links, setLinks] = useState<DonationLinkRow[]>(() =>
    (initial?.links ?? []).map((link) => ({ key: rowKey(), ...link })),
  );
  const [note, setNote] = useState(initial?.note ?? "");
  // Whether the server holds donation info, so turning it off knows to clear it.
  const [stored, setStored] = useState(Boolean(initial));

  const info = normalizeDonationInfo({
    beneficiary,
    accounts: accounts.map(({ bank, hnl, usd }) => ({ bank, hnl, usd })),
    links: links.map(({ label, value, href }) => ({ label, value, href })),
    note,
  });

  const updateRow =
    <T extends { key: string }>(set: Dispatch<SetStateAction<T[]>>) =>
    (key: string, patch: Partial<T>) =>
      set((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  return {
    enabled,
    setEnabled,
    beneficiary,
    setBeneficiary,
    accounts,
    canAddAccount: accounts.length < DONATION_LIMITS.accounts,
    addAccount: () =>
      setAccounts((current) =>
        current.length >= DONATION_LIMITS.accounts ? current : [...current, emptyAccount()],
      ),
    updateAccount: updateRow(setAccounts),
    removeAccount: (key: string) => setAccounts((current) => current.filter((row) => row.key !== key)),
    links,
    canAddLink: links.length < DONATION_LIMITS.links,
    addLink: () =>
      setLinks((current) =>
        current.length >= DONATION_LIMITS.links ? current : [...current, emptyLink()],
      ),
    updateLink: updateRow(setLinks),
    removeLink: (key: string) => setLinks((current) => current.filter((row) => row.key !== key)),
    note,
    setNote,
    problems: enabled ? donationInfoProblems(info) : [],
    /** The `donationInfo` key for the save, or undefined to leave it out. */
    payload: (): EventDonationInfo | null | undefined =>
      enabled ? info : stored ? null : undefined,
    /** The save reached the server, so it now holds what was sent. */
    markSaved: () => setStored(enabled && info !== null),
  };
}
