import type {
  Document,
  FileEntry,
  Folder,
  Project,
  Workspace,
} from "./catalog";

function documentEntry(id: string): FileEntry {
  return { kind: "document", id };
}

function folderEntry(id: string): FileEntry {
  return { kind: "folder", id };
}

const korean: Project = {
  id: "korean",
  name: "Korean",
  description:
    "Build fluency through grammar study, vocabulary, and the Korean used in software development.",
  homeDocumentId: "korean-home",
  courseIds: ["intermediate-grammar", "korean-software", "hanja"],
  files: [
    folderEntry("grammar-notes"),
    folderEntry("vocabulary"),
    folderEntry("resources"),
    documentEntry("study-plan"),
  ],
};

const icDevices: Project = {
  id: "ic-devices",
  name: "IC Devices",
  description:
    "Study how semiconductor structures behave and how they connect.",
  homeDocumentId: "ic-devices-home",
  courseIds: [],
  files: [documentEntry("mos-capacitor"), documentEntry("through-silicon-via")],
};

const integration: Project = {
  id: "3d-integration",
  name: "3D Integration",
  description: "Explore interconnects, packaging, and vertically stacked dies.",
  homeDocumentId: "3d-integration-home",
  courseIds: [],
  files: [
    documentEntry("through-silicon-via"),
    documentEntry("stacking-notes"),
  ],
};

const studio: Project = {
  id: "design-studies",
  name: "Design Studies",
  description: "Collect observations about typography and layout.",
  homeDocumentId: "design-studies-home",
  courseIds: [],
  files: [documentEntry("type-notes")],
};

const folders: readonly Folder[] = [
  {
    id: "grammar-notes",
    name: "Grammar Notes",
    description: "Examples and observations from intermediate grammar study.",
    homeDocumentId: "grammar-notes-home",
    entries: [documentEntry("connective-endings"), folderEntry("practice")],
  },
  {
    id: "practice",
    name: "Practice",
    description: "Short exercises for putting new sentence patterns to use.",
    homeDocumentId: "practice-home",
    entries: [documentEntry("sentence-drills")],
  },
  {
    id: "vocabulary",
    name: "Vocabulary",
    description:
      "Terms collected from reading, conversation, and technical work.",
    homeDocumentId: "vocabulary-home",
    entries: [documentEntry("developer-terms")],
  },
  {
    id: "resources",
    name: "Resources",
    description: "Reference material for reading and grammar study.",
    homeDocumentId: "resources-home",
    entries: [
      documentEntry("grammar-reference"),
      documentEntry("reading-packet"),
    ],
  },
];

const selfTeachingDocuments: readonly Document[] = [
  ...[korean, icDevices, integration].map((project): Document => ({
    id: project.homeDocumentId,
    kind: "project-home",
    title: project.name,
    projectId: project.id,
  })),
  ...folders.flatMap((folder): Document[] =>
    folder.homeDocumentId
      ? [
          {
            id: folder.homeDocumentId,
            kind: "folder-home",
            title: folder.name,
            folderId: folder.id,
          },
        ]
      : [],
  ),
  {
    id: "intermediate-grammar",
    kind: "course",
    title: "Intermediate Grammar",
    description:
      "Work through connective endings, reported speech, and sentence patterns.",
  },
  {
    id: "korean-software",
    kind: "course",
    title: "Korean for Software Development",
    description:
      "Read technical documentation and practice the language of code review.",
  },
  {
    id: "hanja",
    kind: "course",
    title: "Hanja",
    description:
      "Recognize common characters and the Korean words built from them.",
  },
  {
    id: "study-plan",
    kind: "note",
    title: "Study Plan",
    paragraphs: [
      "Start each week with one grammar pattern. Collect two examples from something you read, then write a sentence of your own.",
      "Keep a running list of unfamiliar terms and revisit them at the end of the week.",
    ],
  },
  {
    id: "connective-endings",
    kind: "note",
    title: "Connective Endings",
    paragraphs: [
      "Compare -아/어서 and -(으)니까 when explaining a reason. Record the context and the type of sentence that follows each ending.",
    ],
  },
  {
    id: "sentence-drills",
    kind: "note",
    title: "Sentence Drills",
    paragraphs: [
      "Join two short sentences with a connective ending. Read the result aloud.",
    ],
  },
  {
    id: "developer-terms",
    kind: "note",
    title: "Developer Terms",
    paragraphs: [
      "배포 — deployment",
      "변경 사항 — changes",
      "재현 — reproduction",
    ],
  },
  {
    id: "grammar-reference",
    kind: "pdf",
    title: "Grammar Reference.pdf",
    description:
      "A sample entry for a reference covering intermediate grammar patterns.",
  },
  {
    id: "reading-packet",
    kind: "pdf",
    title: "Reading Packet.pdf",
    description:
      "A sample entry for a collection of short Korean reading passages.",
  },
  {
    id: "mos-capacitor",
    kind: "note",
    title: "MOS Capacitor",
    paragraphs: [
      "Sketch the metal–oxide–semiconductor stack and compare accumulation, depletion, and inversion for a p-type substrate.",
    ],
  },
  {
    id: "through-silicon-via",
    kind: "note",
    title: "Through-Silicon Via",
    paragraphs: [
      "A through-silicon via (TSV) is a vertical electrical connection that passes through a silicon die. TSVs can connect stacked dies while keeping interconnect paths short.",
      "Compare via-first, via-middle, and via-last integration by when the via is formed relative to device fabrication and interconnect processing.",
    ],
  },
  {
    id: "stacking-notes",
    kind: "note",
    title: "Die Stacking Notes",
    paragraphs: [
      "Compare die-to-wafer and wafer-to-wafer bonding by alignment, yield, and thermal constraints.",
    ],
  },
];

const studioDocuments: readonly Document[] = [
  {
    id: studio.homeDocumentId,
    kind: "project-home",
    title: studio.name,
    projectId: studio.id,
  },
  {
    id: "type-notes",
    kind: "note",
    title: "Typography Notes",
    paragraphs: [
      "Compare line length and line spacing when setting long passages of text.",
    ],
  },
];

export const sampleWorkspaces: readonly Workspace[] = [
  {
    id: "self-teaching",
    name: "Self Teaching",
    initialProjectId: korean.id,
    projects: [korean, icDevices, integration],
    folders: Object.fromEntries(folders.map((folder) => [folder.id, folder])),
    documents: Object.fromEntries(
      selfTeachingDocuments.map((document) => [document.id, document]),
    ),
  },
  {
    id: "studio",
    name: "Studio",
    projects: [studio],
    folders: {},
    documents: Object.fromEntries(
      studioDocuments.map((document) => [document.id, document]),
    ),
  },
];
