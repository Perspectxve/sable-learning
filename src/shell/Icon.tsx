import type { ReactNode } from "react";

const paths = {
  back: <path d="M19 12H5m7 7-7-7 7-7" />,
  book: (
    <>
      <path d="M4 5h6a2 2 0 0 1 2 2v13a3 3 0 0 0-3-3H4z" />
      <path d="M20 5h-6a2 2 0 0 0-2 2v13a3 3 0 0 1 3-3h5z" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  folder: (
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  ),
  home: <path d="m3 11 9-7 9 7m-16-1v10h5v-5h4v5h5V10" />,
  note: (
    <>
      <path d="M6 3h8l4 4v14H6zm8 0v5h4" />
      <path d="M9 12h6m-6 4h6" />
    </>
  ),
  pdf: (
    <>
      <path d="M6 3h8l4 4v14H6zm8 0v5h4" />
      <path d="M9 16h6m-6-3h4" />
    </>
  ),
  project: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 9h16m-11 0v11" />
    </>
  ),
  sidebar: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M9 5v14" />
    </>
  ),
  collapse: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M9 5v14m7-10-3 3 3 3" />
    </>
  ),
  expand: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M9 5v14m5-10 3 3-3 3" />
    </>
  ),
  workspace: (
    <>
      <path d="m3 8 9-5 9 5-9 5-9-5z" />
      <path d="m3 12 9 5 9-5m-18 4 9 5 9-5" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof paths;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      data-icon={name}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
